/**
 * UI Styles for Chat Component
 * Extracted common className patterns for consistency and maintainability
 */

// ============================================================================
// Layout & Container Styles
// ============================================================================

export const layout = {
  /** Main container - full screen flex column with black background */
  main: "flex flex-col h-screen bg-black",
  
  /** Main content area - with top padding for fixed header */
  content: "flex-1 overflow-y-auto pt-20",
  
  /** Content container with max-width and padding */
  contentContainer: "max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6",
  
  /** Content container for generator/brainstorm views (more bottom padding for input) */
  contentContainerWithInput: "max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 sm:pb-32",
} as const;

export const containers = {
  /** Card-like container with dark background and border */
  card: "bg-zinc-900 border border-zinc-800 rounded-xl p-4",
  
  /** Card with lighter background */
  cardLight: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4",
  
  /** Modal overlay - fixed fullscreen with backdrop */
  modalOverlay: "fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50",
  
  /** Modal content - dark theme with border */
  modal: "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md",
  
  /** Modal content - wider variant */
  modalWide: "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-lg",
  
  /** Modal content - extra wide variant */
  modalExtraWide: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm sm:max-w-2xl md:max-w-3xl max-h-[90vh] flex flex-col",
  
  /** Settings modal with scrolling */
  modalScroll: "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto",
  
  /** Section with top border */
  section: "border-t border-zinc-700 pt-6",
  
  /** Form section with label */
  formSection: "space-y-4",
  
  /** Form group with label */
  formGroup: "",
  
  /** Input group */
  inputGroup: "flex items-center gap-3",
  
  /** Input row */
  inputRow: "flex gap-3",
  
  /** Button group */
  buttonGroup: "flex gap-3 mt-6",
  
  /** Mobile menu dropdown */
  mobileMenu: "md:hidden bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2 absolute left-0 right-0 top-full mt-2 z-[49]",
};

// ============================================================================
// Header Styles
// ============================================================================

export const header = {
  /** Fixed header with blur and border */
  main: "flex-shrink-0 z-50 fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50",
  
  /** Header container */
  container: "max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4",
  
  /** Header inner - flex row with justify-between */
  inner: "flex items-center justify-between gap-2",
  
  /** Header left section - flex with gap and overflow */
  left: "flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden",
  
  /** Header right section - flex with gap */
  right: "flex items-center gap-1 sm:gap-2",
  
  /** Logo/app icon container */
  logo: "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0",
  
  /** Title container with overflow */
  titleContainer: "min-w-0 flex-1 overflow-hidden",
  
  /** Title text */
  title: "text-lg sm:text-xl font-semibold text-white truncate",
  
  /** Back button */
  backButton: "p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg transition-colors",
  
  /** Back button icon */
  backIcon: "w-4 h-4 sm:w-5 sm:h-5 text-zinc-400",
};

// ============================================================================
// Button Styles
// ============================================================================

export const buttons = {
  /** Primary button - gradient background */
  primary: "px-3 sm:px-4 py-2 text-sm sm:text-base text-white rounded-lg transition-colors bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
  
  /** Secondary button - dark background */
  secondary: "px-3 sm:px-4 py-2 text-sm sm:text-base bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors",
  
  /** Ghost button - transparent with hover */
  ghost: "p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white",
  
  /** Icon button - square with icon */
  icon: "p-1.5 sm:p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors",
  
  /** Small button */
  small: "px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg",
  
  /** Danger button - red */
  danger: "px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700",
  
  /** Success button - green */
  success: "px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700",
  
  /** Loading spinner button */
  spinner: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
  
  /** Bounce animation dots for loading */
  bounceDots: "flex gap-1",
  bounceDot: "w-2 h-2 bg-zinc-500 rounded-full animate-bounce",
};

// ============================================================================
// Input Styles
// ============================================================================

export const inputs = {
  /** Text input base */
  text: "w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:ring-2",
  
  /** Textarea base */
  textarea: "w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 border border-zinc-700 resize-none",
  
  /** Chat input - transparent background */
  chat: "w-full bg-transparent text-white placeholder-zinc-500 px-3 py-2 resize-none focus:outline-none",
  
  /** Input with custom height for chat */
  chatTextarea: "w-full bg-transparent text-white placeholder-zinc-500 px-3 py-2 resize-none focus:outline-none",
  
  /** Label */
  label: "block text-sm font-medium text-zinc-400 mb-2",
  
  /** Small label */
  labelSmall: "block text-xs text-zinc-400 mb-1",
  
  /** Select dropdown */
  select: "w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:ring-2",
  
  /** Checkbox */
  checkbox: "w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500",
  
  /** Range slider */
  range: "w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer",
  
  /** File input */
  file: "w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700",
};

// ============================================================================
// Form & Settings Styles
// ============================================================================

export const forms = {
  /** Form container */
  container: "space-y-6",
  
  /** Section header */
  sectionHeader: "text-sm font-medium text-white",
  
  /** Toggle row */
  toggleRow: "flex items-center gap-3 mb-4",
  
  /** Slider container */
  slider: "flex items-center gap-3",
  
  /** Info box */
  info: "mt-2 p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-400 space-y-1",
  
  /** Info row */
  infoRow: "flex justify-between",
  
  /** Toggle description */
  toggleDescription: "text-xs text-zinc-500 mt-1",
  
  /** Advanced section with left border */
  advancedSection: "space-y-4 pl-4 border-l-2 border-zinc-700",
  
  /** Inline error */
  error: "text-red-400 text-sm mt-1",
  
  /** Inline success */
  success: "text-green-400 text-sm mt-1",
};

// ============================================================================
// Card & List Styles
// ============================================================================

export const cards = {
  /** Grid container */
  grid: "grid gap-4",
  
  /** Grid columns responsive */
  gridResponsive: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  
  /** Card item */
  item: "bg-zinc-800 rounded-xl p-4 hover:bg-zinc-750 transition-colors",
  
  /** Card header */
  header: "flex justify-between items-start mb-3",
  
  /** Card title */
  title: "text-lg font-semibold text-white truncate",
  
  /** Card description */
  description: "text-sm text-zinc-400",
  
  /** Card actions */
  actions: "flex gap-1",
  
  /** Card avatar */
  avatar: "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
  
  /** Small avatar */
  avatarSmall: "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
  
  /** List item */
  listItem: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-zinc-800 transition-colors",
  
  /** List item active */
  listItemActive: "bg-zinc-800",
  
  /** Empty state */
  empty: "text-center py-16",
  
  /** Empty state icon */
  emptyIcon: "w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4",
};

// ============================================================================
// Message & Chat Styles
// ============================================================================

export const messages = {
  /** Message container */
  container: "space-y-4",
  
  /** Message row */
  row: "flex gap-4",
  
  /** Message row - user (right aligned) */
  rowUser: "flex gap-4 justify-end",
  
  /** Message bubble base */
  bubble: "rounded-2xl px-4 py-3",
  
  /** Message bubble - assistant (dark) */
  bubbleAssistant: "bg-zinc-800 text-white",
  
  /** Message bubble - user (grey) */
  bubbleUser: "bg-zinc-700 text-white",
  
  /** Message content max width */
  contentMaxWidth: "max-w-[80%]",
  
  /** Message content - user first */
  contentUserFirst: "max-w-[80%] order-first",
  
  /** Message text */
  text: "whitespace-pre-wrap text-sm",
  
  /** Message meta info */
  meta: "text-xs text-zinc-500 mt-1",
  
  /** Message meta - user aligned */
  metaUser: "text-xs text-zinc-500 mt-1 flex gap-1 ml-2",
  
  /** Message actions */
  actions: "flex gap-1 mt-1",
  
  /** Message actions - user aligned */
  actionsUser: "flex gap-1 mt-1 justify-end",
  
  /** Message edit container */
  editContainer: "space-y-2",
  
  /** Message edit textarea */
  editTextarea: "w-full bg-transparent text-white resize-none focus:outline-none",
};

// ============================================================================
// Avatar & Icon Styles
// ============================================================================

export const avatars = {
  /** Avatar container */
  container: "flex-shrink-0 rounded-lg bg-gradient-to-br flex items-center justify-center",
  
  /** Avatar sizes */
  small: "w-8 h-8",
  medium: "w-10 h-10",
  large: "w-12 h-12",
  xlarge: "w-16 h-16",
  
  /** Avatar text */
  text: "text-sm text-white font-semibold",
  textLarge: "text-xl text-white font-semibold",
  textXlarge: "text-2xl text-white font-semibold",
  
  /** Avatar gradients */
  gradient: {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    amber: "from-amber-500 to-orange-500",
    white: "from-white/20 to-white/10",
  },
  
  /** Image avatar */
  image: "w-8 h-8 rounded-lg object-cover",
  imageLarge: "w-12 h-12 rounded-xl object-cover",
  imageXlarge: "w-16 h-16 rounded-xl object-cover",
};

// ============================================================================
// Dropdown & Menu Styles
// ============================================================================

export const dropdowns = {
  /** Dropdown container */
  container: "relative",
  
  /** Dropdown menu */
  menu: "absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-80 overflow-y-auto shadow-xl",
  
  /** Dropdown menu - right aligned */
  menuRight: "absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto",
  
  /** Dropdown item */
  item: "w-full flex items-center gap-2 px-3 py-2 text-white rounded-lg transition-colors",
  
  /** Dropdown item - hover */
  itemHover: "hover:bg-zinc-700",
  
  /** Dropdown item - active/selected */
  itemActive: "bg-zinc-700",
  
  /** Dropdown section */
  section: "border-t border-zinc-800",
  
  /** Dropdown label */
  label: "px-3 py-2 text-xs text-zinc-500",
  
  /** Connection status dot */
  statusDot: "w-2 h-2 rounded-full",
  statusConnected: "bg-green-500",
  statusTesting: "bg-yellow-500",
  statusError: "bg-red-500",
  statusDisconnected: "bg-zinc-500",
};

// ============================================================================
// Loading & Animation Styles
// ============================================================================

export const loading = {
  /** Loading container */
  container: "flex items-center justify-center h-full min-h-[400px]",
  
  /** Loading spinner */
  spinner: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
  
  /** Loading dots */
  dots: "flex gap-1",
  
  /** Loading dot */
  dot: "w-2 h-2 bg-zinc-500 rounded-full",
  
  /** Loading text */
  text: "text-sm text-zinc-500",
  
  /** Loading with text */
  withText: "flex items-center gap-2 text-zinc-500",
};

// ============================================================================
// Error & Toast Styles
// ============================================================================

export const notifications = {
  /** Error banner */
  error: "fixed top-[73px] left-0 right-0 z-40 px-4 py-3",
  errorInner: "bg-red-900/80 border border-red-700 rounded-lg px-4 py-3 text-red-200 shadow-xl backdrop-blur-sm",
  errorContent: "overflow-y-auto whitespace-pre-wrap",
  errorActions: "flex justify-end gap-2 mt-3 pt-3 border-t border-red-700/50",
  
/** Toast notification */
toast: "fixed bottom-32 left-0 right-0 z-[5000] px-4 py-3",
toastInner: "bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white shadow-xl backdrop-blur-sm flex items-center justify-between",
toastContent: "flex items-center gap-3",
  
  /** Info notification */
  info: "bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-400",
  
  /** Success notification */
  success: "bg-green-900/50 border border-green-800 rounded-lg px-4 py-3 text-green-200 text-sm",
  
  /** Warning notification */
  warning: "bg-amber-900/50 border border-amber-800 rounded-lg px-4 py-3 text-amber-200 text-sm",
};

// ============================================================================
// Step Indicator Styles (for VN Generator)
// ============================================================================

export const steps = {
  /** Container */
  container: "flex items-center gap-2 text-sm",
  
  /** Step item */
  item: "flex items-center",
  
  /** Step circle */
  circle: "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
  circleActive: "bg-blue-500 text-white",
  circleInactive: "bg-zinc-700 text-zinc-400",
  circleCompleted: "bg-green-500 text-white",
  
  /** Step connector */
  connector: "w-8 h-0.5",
  connectorActive: "bg-blue-500",
  connectorInactive: "bg-zinc-700",
  
  /** Step label */
  label: "text-xs text-zinc-500",
};

// ============================================================================
// Utility Classes
// ============================================================================

export const utils = {
  /** Text truncation */
  truncate: "truncate",
  
  /** Overflow hidden with ellipsis */
  overflow: "min-w-0 flex-1 overflow-hidden",
  
  /** Scrollable */
  scrollable: "overflow-y-auto",
  
  /** Scrollable with max height */
  scrollableMaxHeight: "overflow-y-auto max-h-[calc(90vh-200px)]",
  
  /** Flex center */
  flexCenter: "flex items-center justify-center",
  
  /** Flex between */
  flexBetween: "flex items-center justify-between",
  
  /** Flex gap */
  flexGap2: "flex gap-2",
  flexGap3: "flex gap-3",
  flexGap4: "flex gap-4",
  
  /** Space between */
  spaceY2: "space-y-2",
  spaceY3: "space-y-3",
  spaceY4: "space-y-4",
  spaceY6: "space-y-6",
  
  /** Visibility */
  hidden: "hidden",
  visible: "visible",
  
  /** Text colors */
  textMuted: "text-zinc-400",
  textDim: "text-zinc-500",
  textLight: "text-zinc-300",
  textWhite: "text-white",
  
  /** Text sizes */
  textXs: "text-xs",
  textSm: "text-sm",
  textBase: "text-base",
  textLg: "text-lg",
  textXl: "text-xl",
  
  /** Font weights */
  fontMedium: "font-medium",
  fontSemibold: "font-semibold",
  fontBold: "font-bold",
  
  /** Spacing */
  mt2: "mt-2",
  mt3: "mt-3",
  mt4: "mt-4",
  mt6: "mt-6",
  mb2: "mb-2",
  mb3: "mb-3",
  mb4: "mb-4",
  mb6: "mb-6",
  p2: "p-2",
  p3: "p-3",
  p4: "p-4",
  p6: "p-6",
  px2: "px-2",
  px3: "px-3",
  px4: "px-4",
  py1: "py-1",
  py2: "py-2",
  py3: "py-3",
  py4: "py-4",
  
  /** Responsive - mobile hidden */
  mdFlex: "hidden md:flex",
  mdBlock: "hidden md:block",
};

// ============================================================================
// Combined Common Patterns
// ============================================================================

/** Common patterns for reference */
export const patterns = {
  /** Form field with label */
  formField: `
    <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
    <input className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:ring-2" />
  `,
  
  /** Modal with header and footer */
  modal: `
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        {children}
        <div className="flex gap-3 mt-6">
          <button className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600">Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm</button>
        </div>
      </div>
    </div>
  `,
  
  /** Card with avatar and content */
  cardWithAvatar: `
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
        <span className="text-xl text-white font-semibold">{initial}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold text-white truncate">{name}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  `,
};
