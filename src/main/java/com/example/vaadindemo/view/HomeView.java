package com.example.vaadindemo.view;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.HasDynamicTitle;
import com.vaadin.flow.router.Route;

@Route("")
public class HomeView extends VerticalLayout implements HasDynamicTitle {

    public HomeView() {
        addClassNames("home-view", "page-shell");
        setSizeFull();
        setPadding(false);
        setSpacing(false);

        Div intro = new Div();
        intro.addClassNames("content-card", "x-intro");
        intro.add(
                new Span("Praxisdemo"),
                new H2("Willkommen zur Vaadin-Flow-Demo"),
                new Paragraph("Dies ist eine kleine Vaadin-Flow-Demo fuer einen kompakten Praxisteil."),
                new Paragraph("Die Navigation links zeigt Routing ueber zwei serverseitige Java-Views."),
                new Paragraph("Die Kundenansicht demonstriert Grid, Formular, Binder, Spring Service und Datenbankzugriff.")
        );
        intro.getChildren().findFirst().ifPresent(component -> component.getElement().getClassList().add("home-eyebrow"));

        Div tiles = new Div(
                createInfoTile("Routing", "Zwei Views werden ueber @Route direkt in Java sichtbar."),
                createInfoTile("Grid", "Kundendaten kommen aus dem Spring-Service und werden im Grid angezeigt."),
                createInfoTile("Binder", "Das Formular zeigt Validierung und sauberes Schreiben in das Entity."),
                createInfoTile("JPA", "Repository und Service verbinden die View direkt mit PostgreSQL.")
        );
        tiles.addClassName("info-grid");

        Div container = new Div(intro, tiles);
        container.addClassNames("content-container", "home-container");

        add(container);
    }

    private Div createInfoTile(String title, String text) {
        Div tile = new Div();
        tile.addClassName("info-tile");
        tile.add(new H3(title), new Paragraph(text));
        return tile;
    }

    @Override
    public String getPageTitle() {
        return "Start";
    }
}
