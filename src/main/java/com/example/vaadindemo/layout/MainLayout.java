package com.example.vaadindemo.layout;

import com.example.vaadindemo.view.CustomersView;
import com.example.vaadindemo.view.HomeView;
import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.applayout.DrawerToggle;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.page.ColorScheme;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.sidenav.SideNav;
import com.vaadin.flow.component.sidenav.SideNavItem;
import com.vaadin.flow.router.AfterNavigationEvent;
import com.vaadin.flow.router.AfterNavigationObserver;
import com.vaadin.flow.router.HasDynamicTitle;
import com.vaadin.flow.router.Layout;

@Layout
public class MainLayout extends AppLayout implements AfterNavigationObserver {

    private final H1 viewTitle = new H1();
    private final Button colorSchemeToggle = new Button();
    private boolean darkMode = false;

    public MainLayout() {
        setPrimarySection(Section.DRAWER);
        addToNavbar(createHeader());
        addToDrawer(createDrawer());
        restoreColorScheme();
    }

    private Component createHeader() {
        viewTitle.addClassName("view-title");

        DrawerToggle drawerToggle = new DrawerToggle();
        drawerToggle.addClassName("drawer-toggle");

        HorizontalLayout routeInfo = new HorizontalLayout(drawerToggle, viewTitle);
        routeInfo.addClassName("route-info");
        routeInfo.setAlignItems(FlexComponent.Alignment.CENTER);
        routeInfo.setSpacing(true);

        Span brandTitle = new Span("Vaadin Demo");
        brandTitle.addClassName("app-brand-title");

        Image logo = new Image("images/vaadin-logo.svg", "Vaadin Logo");
        logo.addClassName("app-brand-logo");

        Div brand = new Div(logo, brandTitle);
        brand.addClassName("app-brand");

        configureColorSchemeToggle();

        Div headerActions = new Div(colorSchemeToggle);
        headerActions.addClassName("header-actions");

        HorizontalLayout header = new HorizontalLayout(routeInfo, brand, headerActions);
        header.addClassName("app-header");
        header.setAlignItems(FlexComponent.Alignment.CENTER);
        header.setWidthFull();
        return header;
    }

    private void configureColorSchemeToggle() {
        colorSchemeToggle.addClassName("theme-toggle");
        colorSchemeToggle.addThemeVariants(ButtonVariant.LUMO_TERTIARY);
        colorSchemeToggle.addClickListener(event -> applyColorScheme(!darkMode, true));
        updateColorSchemeToggle();
    }

    private void restoreColorScheme() {
        getElement().executeJs("""
                const storedScheme = localStorage.getItem('vaadin-demo-color-scheme');
                return storedScheme || 'light';
                """).then(String.class, scheme -> applyColorScheme(!"light".equals(scheme), false));
    }

    private void applyColorScheme(boolean useDarkMode, boolean persist) {
        darkMode = useDarkMode;
        UI.getCurrent().getPage().setColorScheme(useDarkMode ? ColorScheme.Value.DARK : ColorScheme.Value.LIGHT);
        updateColorSchemeToggle();

        if (persist) {
            getElement().executeJs(
                    "localStorage.setItem('vaadin-demo-color-scheme', $0);",
                    useDarkMode ? "dark" : "light"
            );
        }
    }

    private void updateColorSchemeToggle() {
        colorSchemeToggle.setIcon(darkMode ? VaadinIcon.SUN_O.create() : VaadinIcon.MOON_O.create());
        colorSchemeToggle.getElement().setAttribute("aria-label", darkMode ? "Light Mode aktivieren" : "Dark Mode aktivieren");
        colorSchemeToggle.getElement().setAttribute("title", darkMode ? "Light Mode aktivieren" : "Dark Mode aktivieren");
    }

    private Component createDrawer() {
        Span appName = new Span("Navigation");
        appName.addClassName("app-name");

        SideNav navigation = new SideNav();
        navigation.addClassName("app-nav");
        navigation.addItem(new SideNavItem("Start", HomeView.class));
        navigation.addItem(new SideNavItem("Kundenverwaltung", CustomersView.class));

        com.vaadin.flow.component.orderedlayout.VerticalLayout drawer =
                new com.vaadin.flow.component.orderedlayout.VerticalLayout(appName, navigation);
        drawer.addClassName("app-drawer");
        drawer.setPadding(false);
        drawer.setSpacing(false);
        return drawer;
    }

    @Override
    public void afterNavigation(AfterNavigationEvent event) {
        Component content = getContent();
        if (content instanceof HasDynamicTitle titledView) {
            viewTitle.setText(titledView.getPageTitle());
        }
    }
}
