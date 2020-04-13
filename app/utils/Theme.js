export const lightTheme = {
  "body-bg": "#fff",
  "body-color": "#212529",
  "input-bg": "#fff",
  "input-border-color": "#ced4da",
  "input-group-addon-bg": "#e9ecef",
  "input-color": "#495057",
  "list-group-border-color": "rgba(0, 0, 0, 0.125)",
  "list-group-hover-bg": "#f8f9fa",
  "list-group-bg": "#fff",
  "card-bg": "#fff",
  "card-border-color": "rgba(0, 0, 0, 0.125)",
  "component-active-bg": "#007bff",
  "navbar-dark-color": "hsla(0, 0%, 100%, 0.5)",
  "headings-color": "gray",
  "link-color": "black",
  blue: "#007bff",
  indigo: "#6610f2",
  purple: "#6f42c1",
  pink: "#e83e8c",
  red: "#dc3545",
  orange: "#fd7e14",
  yellow: "#ffc107",
  green: "#28a745",
  teal: "#20c997",
  cyan: "#17a2b8",
  white: "#fff",
  gray: "#6c757d",
  "gray-dark": "#343a40",
  primary: "#007bff",
  secondary: "#6c757d",
  success: "#28a745",
  info: "#17a2b8",
  warning: "#ffc107",
  danger: "#dc3545",
  light: "#f8f9fa",
  dark: "#343a40; ",
};

export const darkTheme = {
  gray: "#303030",
  "gray-dark": "#151515",
  "gray-light": "gray",
  "gray-lighter": "gray",
  "gray-lightest": "gray",

  // Base
  "body-bg": "#252525",
  "body-color": "white",
  "link-color": "white",
  "brand-primary": "white",

  // Navbar
  dark: "#151515",

  // Input
  "input-bg": "rgb(53, 53, 53)",
  "input-border-color": "rgb(53, 53, 53)",
  "input-group-addon-bg": "rgb(53, 53, 53)",
  "input-color": "white",

  // List Group
  "list-group-border-color": "black",
  "list-group-link-color": "white",
  "list-group-hover-bg": "#333",
  "list-group-active-border": "black",
  "list-group-bg": "#484848",

  // Card
  "card-bg": "#484848",
  "card-border-color": "none",
  "card-color": "white",

  // Components
  "component-active-bg": "gray",
  "headings-color": "white",
  "navbar-dark-color": "#848484",
};

export default class Theme {
  theme = "light";

  themes = {
    light: lightTheme,
    dark: darkTheme,
  };

  constructor(themeColor: string = this.theme) {
    this.theme = themeColor;
    this.change(this.theme);
  }

  change(themeColor: string) {
    if (!(themeColor in this.themes)) {
      throw new Error(`Theme color name "${themeColor}" not found`);
    }
    const styles = this.themes[themeColor];
    Object.entries(styles).forEach(([cssVar, value]) => {
      document.documentElement.style.setProperty(`--${cssVar}`, value);
    });
  }
}
