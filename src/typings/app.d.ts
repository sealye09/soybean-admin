/* eslint-disable ts/consistent-type-definitions */
/** The global namespace for the app */
declare namespace App {
  /** Theme namespace */
  namespace Theme {
    type ColorPaletteNumber = import('@sa/color-palette').ColorPaletteNumber;

    /** Theme token */
    type ThemeToken = {
      colors: ThemeTokenColor
      boxShadow: {
        header: string
        sider: string
        tab: string
      }
    };

    /** Theme setting */
    type ThemeSetting = {
      /** Theme scheme */
      themeScheme: UnionKey.ThemeScheme
      /** Theme color */
      themeColor: string
      /** Other color */
      otherColor: OtherColor
      /** Whether info color is followed by the primary color */
      isInfoFollowPrimary: boolean
      /** Layout */
      layout: {
        /** Layout mode */
        mode: UnionKey.ThemeLayoutMode
        /** Scroll mode */
        scrollMode: UnionKey.ThemeScrollMode
      }
      /** Page */
      page: {
        /** Whether to show the page transition */
        animate: boolean
        /** Page animate mode */
        animateMode: UnionKey.ThemePageAnimateMode
      }
      /** Header */
      header: {
        /** Header height */
        height: number
        /** Header breadcrumb */
        breadcrumb: {
          /** Whether to show the breadcrumb */
          visible: boolean
          /** Whether to show the breadcrumb icon */
          showIcon: boolean
        }
      }
      /** Tab */
      tab: {
        /** Whether to show the tab */
        visible: boolean
        /**
         * Whether to cache the tab
         *
         * If cache, the tabs will get from the local storage when the page is refreshed
         */
        cache: boolean
        /** Tab height */
        height: number
        /** Tab mode */
        mode: UnionKey.ThemeTabMode
      }
      /** Fixed header and tab */
      fixedHeaderAndTab: boolean
      /** Sider */
      sider: {
        /** Inverted sider */
        inverted: boolean
        /** Sider width */
        width: number
        /** Collapsed sider width */
        collapsedWidth: number
        /** Sider width when the layout is 'vertical-mix' or 'horizontal-mix' */
        mixWidth: number
        /** Collapsed sider width when the layout is 'vertical-mix' or 'horizontal-mix' */
        mixCollapsedWidth: number
        /** Child menu width when the layout is 'vertical-mix' or 'horizontal-mix' */
        mixChildMenuWidth: number
      }
      /** Footer */
      footer: {
        /** Whether to show the footer */
        visible: boolean
        /** Whether fixed the footer */
        fixed: boolean
        /** Footer height */
        height: number
        /** Whether float the footer to the right when the layout is 'horizontal-mix' */
        right: boolean
      }
    };

    type OtherColor = {
      info: string
      success: string
      warning: string
      error: string
    };

    type ThemeColor = {
      primary: string
    } & OtherColor;

    type ThemeColorKey = keyof ThemeColor;

    type ThemePaletteColor = {
      [key in ThemeColorKey | `${ThemeColorKey}-${ColorPaletteNumber}`]: string;
    };

    type BaseToken = Record<string, Record<string, string>>;

    type ThemeTokenColor = {
      nprogress: string
      container: string
      layout: string
      inverted: string
      base_text: string
      [key: string]: string
    } & ThemePaletteColor;
  }

  /** Global namespace */
  namespace Global {
    type VNode = import('vue').VNode;
    type RouteLocationNormalizedLoaded = import('vue-router').RouteLocationNormalizedLoaded;
    type RouteKey = string;
    type RouteMap = <T extends RouteKey = RouteKey>() => Record<T, string>;
    type RoutePath = string;
    type LastLevelRouteKey = string;

    /** The global header props */
    type HeaderProps = {
      /** Whether to show the logo */
      showLogo?: boolean
      /** Whether to show the menu toggler */
      showMenuToggler?: boolean
      /** Whether to show the menu */
      showMenu?: boolean
    };

    /** The global menu */
    type Menu = {
      /**
       * The menu key
       *
       * Equal to the route key
       */
      key: string
      /** The menu label */
      label: string
      /** The menu i18n key */
      i18nKey?: I18n.I18nKey
      /** The route key */
      routeKey: RouteKey
      /** The route path */
      routePath: RoutePath
      /** The menu icon */
      icon?: () => VNode
      /** The menu children */
      children?: Menu[]
    };

    type Breadcrumb = Omit<Menu, 'children'> & {
      options?: Breadcrumb[]
    };

    /** Tab route */
    type TabRoute = Pick<RouteLocationNormalizedLoaded, 'name' | 'path' | 'meta'> &
      Partial<Pick<RouteLocationNormalizedLoaded, 'fullPath' | 'query'>>;

    /** The global tab */
    type Tab = {
      /** The tab id */
      id: string
      /** The tab label */
      label: string
      /**
       * The new tab label
       *
       * If set, the tab label will be replaced by this value
       */
      newLabel?: string
      /** The tab route key */
      routeKey: LastLevelRouteKey
      /** The tab route path */
      routePath: string
      /** The tab route full path */
      fullPath: string
      /** The tab fixed index */
      fixedIndex?: number
      /**
       * Tab icon
       *
       * Iconify icon
       */
      icon?: string
      /**
       * Tab local icon
       *
       * Local icon
       */
      localIcon?: string
      /** I18n key */
      i18nKey?: I18n.I18nKey
    };

    /** Form rule */
    type FormRule = import('naive-ui').FormItemRule;

    /** The global dropdown key */
    type DropdownKey = 'closeCurrent' | 'closeOther' | 'closeLeft' | 'closeRight' | 'closeAll';
  }

  /**
   * I18n namespace
   *
   * Locales type
   */
  namespace I18n {
    type RouteKey = string;

    type LangType = 'en-US' | 'zh-CN';

    type LangOption = {
      label: string
      key: LangType
    };

    type I18nRouteKey = Exclude<RouteKey, 'root' | 'not-found'>;

    type FormMsg = {
      required: string
      invalid: string
    };

    type Schema = {
      system: {
        title: string
      }
      common: {
        tip: string
        add: string
        addSuccess: string
        edit: string
        editSuccess: string
        delete: string
        deleteSuccess: string
        batchDelete: string
        confirm: string
        cancel: string
        pleaseCheckValue: string
        action: string
        backToHome: string
        lookForward: string
        userCenter: string
        logout: string
        logoutConfirm: string
      }
      theme: {
        themeSchema: { title: string } & Record<UnionKey.ThemeScheme, string>
        layoutMode: { title: string } & Record<UnionKey.ThemeLayoutMode, string>
        themeColor: {
          title: string
          followPrimary: string
        } & Theme.ThemeColor
        scrollMode: { title: string } & Record<UnionKey.ThemeScrollMode, string>
        page: {
          animate: string
          mode: { title: string } & Record<UnionKey.ThemePageAnimateMode, string>
        }
        fixedHeaderAndTab: string
        header: {
          height: string
          breadcrumb: {
            visible: string
            showIcon: string
          }
        }
        tab: {
          visible: string
          cache: string
          height: string
          mode: { title: string } & Record<UnionKey.ThemeTabMode, string>
        }
        sider: {
          inverted: string
          width: string
          collapsedWidth: string
          mixWidth: string
          mixCollapsedWidth: string
          mixChildMenuWidth: string
        }
        footer: {
          visible: string
          fixed: string
          height: string
          right: string
        }
        themeDrawerTitle: string
        pageFunTitle: string
        configOperation: {
          copyConfig: string
          copySuccessMsg: string
          resetConfig: string
          resetSuccessMsg: string
        }
      }
      route: Record<I18nRouteKey, string>
      page: {
        login: {
          common: {
            loginOrRegister: string
            userNamePlaceholder: string
            phonePlaceholder: string
            codePlaceholder: string
            passwordPlaceholder: string
            confirmPasswordPlaceholder: string
            codeLogin: string
            confirm: string
            back: string
            validateSuccess: string
            loginSuccess: string
            welcomeBack: string
          }
          pwdLogin: {
            title: string
            rememberMe: string
            forgetPassword: string
            register: string
            otherAccountLogin: string
            otherLoginMode: string
            superAdmin: string
            admin: string
            user: string
          }
          codeLogin: {
            title: string
            getCode: string
            imageCodePlaceholder: string
          }
          register: {
            title: string
            agreement: string
            protocol: string
            policy: string
          }
          resetPwd: {
            title: string
          }
          bindWeChat: {
            title: string
          }
        }
      }
      form: {
        username: FormMsg
        phone: FormMsg
        pwd: FormMsg
        code: FormMsg
        email: FormMsg
      }
      dropdown: Record<Global.DropdownKey, string>
      icon: {
        themeConfig: string
        themeSchema: string
        lang: string
        fullscreen: string
        fullscreenExit: string
        reload: string
        collapse: string
        expand: string
        pin: string
        unpin: string
      }
    };

    type GetI18nKey<T extends Record<string, unknown>, K extends keyof T = keyof T> = K extends string
      ? T[K] extends Record<string, unknown>
        ? `${K}.${GetI18nKey<T[K]>}`
        : K
      : never;

    type I18nKey = GetI18nKey<Schema>;

    type TranslateOptions<Locales extends string> = import('vue-i18n').TranslateOptions<Locales>;

    type $T = {
      (key: I18nKey): string
      (key: I18nKey, plural: number, options?: TranslateOptions<LangType>): string
      (key: I18nKey, defaultMsg: string, options?: TranslateOptions<I18nKey>): string
      (key: I18nKey, list: unknown[], options?: TranslateOptions<I18nKey>): string
      (key: I18nKey, list: unknown[], plural: number): string
      (key: I18nKey, list: unknown[], defaultMsg: string): string
      (key: I18nKey, named: Record<string, unknown>, options?: TranslateOptions<LangType>): string
      (key: I18nKey, named: Record<string, unknown>, plural: number): string
      (key: I18nKey, named: Record<string, unknown>, defaultMsg: string): string
    };
  }

  /** Service namespace */
  namespace Service {
    /** The backend service env type */
    type EnvType = 'dev' | 'test' | 'prod';

    /** Other baseURL key */
    type OtherBaseURLKey = 'demo';

    /** The backend service config */
    type ServiceConfig = {
      /** The backend service base url */
      baseURL: string
    };

    /** The backend service config map */
    type ServiceConfigMap = Record<EnvType, ServiceConfig>;

  }
}
