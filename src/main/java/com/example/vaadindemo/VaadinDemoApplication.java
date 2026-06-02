package com.example.vaadindemo;

import com.vaadin.flow.component.dependency.StyleSheet;
import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.component.page.ColorScheme;
import com.vaadin.flow.theme.aura.Aura;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@ColorScheme(ColorScheme.Value.DARK_LIGHT)
@StyleSheet(Aura.STYLESHEET)
@StyleSheet("styles.css")
public class VaadinDemoApplication implements AppShellConfigurator {

    public static void main(String[] args) {
        SpringApplication.run(VaadinDemoApplication.class, args);
    }
}
