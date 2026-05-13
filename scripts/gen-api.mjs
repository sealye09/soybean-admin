import { readFileSync, writeFileSync, renameSync, existsSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// 解析 CLI 参数
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    input: null,
    output: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-i' || arg === '--input') {
      result.input = args[++i];
    } else if (arg === '-o' || arg === '--output') {
      result.output = args[++i];
    } else if (arg === '-h' || arg === '--help') {
      result.help = true;
    }
  }

  return result;
}

const { input, output, help } = parseArgs();

if (help) {
  console.log(`
用法: node scripts/gen-api.mjs [选项]

选项:
  -i, --input <path>    OpenAPI 规范文件路径 (默认: api-docs/admin.json)
  -o, --output <path>   输出目录路径 (默认: src/service/api/generated)
  -h, --help            显示帮助信息

环境变量:
  OPENAPI_SPEC          OpenAPI 规范文件路径 (与 -i 参数等效)

示例:
  node scripts/gen-api.mjs
  node scripts/gen-api.mjs -i api-docs/custom.json -o src/service/api/custom
  node scripts/gen-api.mjs --input openapi.json --output src/api/generated
`);
  process.exit(0);
}

const specPath = input ? resolve(root, input) : resolve(root, process.env.OPENAPI_SPEC || 'api-docs/admin.json');
const outputPath = output ? resolve(root, output) : resolve(root, 'src/service/api/generated');

console.log('读取 OpenAPI 规范:', specPath);
const spec = JSON.parse(readFileSync(specPath, 'utf-8'));

// Collect Result* schemas for response unwrapping
const resultSchemas = new Map();
for (const [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
  if (name.startsWith('Result')) {
    resultSchemas.set(name, schema);
  }
}

rmSync(outputPath, { recursive: true, force: true });

// Step 1: Generate types with @hey-api/openapi-ts
console.log('生成 TypeScript 类型...');
const openapiTsArgs = `--input ${specPath} --output ${outputPath}`;
execSync(`pnpm exec openapi-ts ${openapiTsArgs}`, { stdio: 'inherit', cwd: root });

// Rename hey-api output files to remove .gen suffix
const typesGenPath = resolve(outputPath, 'types.gen.ts');
if (existsSync(typesGenPath)) {
  renameSync(typesGenPath, resolve(outputPath, 'types.ts'));
}

// Step 2: Generate API functions grouped by tag
console.log('\n生成 API 函数...');

function toTsName(name) {
  return name.replace(/DTO$/, 'Dto').replace(/VO$/, 'Vo');
}

function schemaToTs(schema) {
  if (!schema) return 'unknown';
  if (schema.$ref) {
    return toTsName(schema.$ref.replace('#/components/schemas/', ''));
  }
  if (schema.type === 'array') {
    return `Array<${schemaToTs(schema.items)}>`;
  }
  if (schema.type === 'object' && schema.additionalProperties) {
    return 'Record<string, unknown>';
  }
  if (schema.type === 'string' && schema.enum) {
    return schema.enum.map(e => `'${e}'`).join(' | ');
  }
  if (schema.type === 'string') return 'string';
  if (schema.type === 'integer' || schema.type === 'number') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  return 'unknown';
}

function collectTypes(schema, types) {
  if (!schema) return;
  if (schema.$ref) {
    types.add(toTsName(schema.$ref.replace('#/components/schemas/', '')));
  }
  if (schema.type === 'array' && schema.items) {
    collectTypes(schema.items, types);
  }
  if (schema.properties) {
    for (const prop of Object.values(schema.properties)) {
      collectTypes(prop, types);
    }
  }
}

function unwrapResultType(schema) {
  if (schema?.$ref) {
    const schemaName = schema.$ref.replace('#/components/schemas/', '');
    if (resultSchemas.has(schemaName)) {
      const dataProp = resultSchemas.get(schemaName)?.properties?.data;
      if (dataProp) return dataProp;
    }
  }
  return schema;
}

// Group operations by tag
const tagGroups = {};
for (const [urlPath, methods] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    if (typeof operation !== 'object' || !operation.operationId) continue;

    const tag = (operation.tags || ['default'])[0];
    const tagName = tag.replace(/^admin-/, '').replace(/-controller$/, '');

    if (!tagGroups[tagName]) tagGroups[tagName] = [];
    tagGroups[tagName].push({ urlPath, method, operation });
  }
}

let totalFunctions = 0;
const tagNames = [];

for (const [tagName, operations] of Object.entries(tagGroups)) {
  const functions = [];
  const usedTypes = new Set();

  for (const { urlPath, method, operation } of operations) {
    const fnName = tagName + operation.operationId.charAt(0).toUpperCase() + operation.operationId.slice(1);
    const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
    const headerParams = (operation.parameters || []).filter(p => p.in === 'header');

    const bodySchema = operation.requestBody?.content?.['application/json']?.schema;
    const rawResponseSchema = operation.responses?.['200']?.content?.['*/*']?.schema;
    const responseSchema = unwrapResultType(rawResponseSchema);
    const responseType = schemaToTs(responseSchema);

    collectTypes(bodySchema, usedTypes);
    collectTypes(responseSchema, usedTypes);

    const args = [];
    if (headerParams.length > 0) {
      args.push(`headers: { ${headerParams.map(p => `'${p.name}': ${schemaToTs(p.schema)}`).join(', ')} }`);
    }
    if (queryParams.length > 0) {
      args.push(
        `query: { ${queryParams.map(p => `${p.name}${p.required ? '' : '?'}: ${schemaToTs(p.schema)}`).join(', ')} }`
      );
    }
    if (bodySchema) {
      args.push(`body: ${schemaToTs(bodySchema)}`);
    }

    const config = [`url: '${urlPath}'`, `method: '${method}'`];
    if (headerParams.length > 0) config.push('headers');
    if (queryParams.length > 0) config.push('params: query');
    if (bodySchema) config.push('data: body');

    functions.push(
      `export function ${fnName}(${args.join(', ')}) {\n` +
        `  return request<${responseType}>({\n` +
        `    ${config.join(',\n    ')}\n` +
        `  });\n` +
        `}`
    );
  }

  const typeImports = [...usedTypes].sort();
  const content =
    `// Auto-generated by gen-api.mjs - do not edit manually\n` +
    `import { request } from '../../request';\n` +
    (typeImports.length > 0 ? `import type { ${typeImports.join(', ')} } from './types';\n` : '') +
    `\n${functions.join('\n\n')}\n`;

  writeFileSync(resolve(outputPath, `${tagName}.ts`), content);
  tagNames.push(tagName);
  totalFunctions += functions.length;
}

// Generate index.ts
const indexContent =
  `// Auto-generated by gen-api.mjs - do not edit manually\n` +
  tagNames.map(t => `export * from './${t}';`).join('\n') +
  `\nexport type * from './types';\n`;

writeFileSync(resolve(outputPath, 'index.ts'), indexContent);

console.log(`已生成 ${totalFunctions} 个 API 函数，共 ${tagNames.length} 个模块`);

// Step 3: Format and lint generated files
console.log('\n格式化生成文件...');
execSync(`pnpm oxfmt ${outputPath}`, { stdio: 'inherit', cwd: root });
execSync(`pnpm oxlint --fix ${outputPath}`, { stdio: 'inherit', cwd: root });
console.log('模块:', tagNames.map(t => `${t}.ts`).join(', '));
console.log('\n完成!');
