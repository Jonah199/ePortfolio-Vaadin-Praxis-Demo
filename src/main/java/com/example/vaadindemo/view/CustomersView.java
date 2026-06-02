package com.example.vaadindemo.view;

import com.example.vaadindemo.customer.Customer;
import com.example.vaadindemo.customer.CustomerService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.EmailField;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.data.binder.Binder;
import com.vaadin.flow.data.binder.ValidationException;
import com.vaadin.flow.data.validator.EmailValidator;
import com.vaadin.flow.router.HasDynamicTitle;
import com.vaadin.flow.router.Route;

import java.util.List;

@Route("customers")
public class CustomersView extends VerticalLayout implements HasDynamicTitle {

    private final CustomerService customerService;
    private final Grid<Customer> grid = new Grid<>(Customer.class, false);
    private final Binder<Customer> binder = new Binder<>(Customer.class);

    private final TextField firstName = new TextField("Vorname");
    private final TextField lastName = new TextField("Nachname");
    private final EmailField email = new EmailField("E-Mail");
    private final TextField company = new TextField("Firma");

    private Customer editedCustomer;

    public CustomersView(CustomerService customerService) {
        this.customerService = customerService;

        addClassNames("customers-view", "page-shell");
        setSizeFull();
        setPadding(false);
        setSpacing(false);

        configureGrid();
        configureForm();

        Div gridPanel = new Div(grid);
        gridPanel.addClassName("customers-grid-panel");

        HorizontalLayout layout = new HorizontalLayout(gridPanel, createFormLayout());
        layout.addClassName("customers-layout");
        layout.setSizeFull();
        layout.setFlexGrow(1, gridPanel);

        Div container = new Div();
        container.addClassNames("content-container", "customers-container");
        container.add(createPageHeader(), layout);

        add(container);
        setFlexGrow(1, container);
        refreshGrid();
        clearForm();
    }

    private void configureGrid() {
        grid.addClassName("customers-grid");
        grid.setSizeFull();
        grid.addColumn(Customer::getId).setHeader("ID").setAutoWidth(true);
        grid.addColumn(Customer::getFirstName).setHeader("Vorname").setAutoWidth(true);
        grid.addColumn(Customer::getLastName).setHeader("Nachname").setAutoWidth(true);
        grid.addColumn(Customer::getEmail).setHeader("E-Mail").setAutoWidth(true);
        grid.addColumn(Customer::getCompany).setHeader("Firma").setAutoWidth(true);
        grid.asSingleSelect().addValueChangeListener(event -> editCustomer(event.getValue()));
    }

    private void configureForm() {
        firstName.setRequiredIndicatorVisible(true);
        lastName.setRequiredIndicatorVisible(true);
        email.setRequiredIndicatorVisible(true);

        binder.forField(firstName)
                .asRequired("Vorname ist Pflicht")
                .bind(Customer::getFirstName, Customer::setFirstName);

        binder.forField(lastName)
                .asRequired("Nachname ist Pflicht")
                .bind(Customer::getLastName, Customer::setLastName);

        binder.forField(email)
                .asRequired("E-Mail ist Pflicht")
                .withValidator(new EmailValidator("Bitte eine gültige E-Mail-Adresse eingeben"))
                .bind(Customer::getEmail, Customer::setEmail);

        binder.forField(company)
                .bind(Customer::getCompany, Customer::setCompany);

    }

    private Div createPageHeader() {
        H2 title = new H2("Kundenverwaltung");

        Div header = new Div(title);
        header.addClassName("customers-page-header");
        return header;
    }

    private VerticalLayout createFormLayout() {
        Button saveButton = new Button("Speichern", event -> saveCustomer());
        saveButton.addThemeVariants(ButtonVariant.LUMO_PRIMARY);

        Button cancelButton = new Button("Abbrechen", event -> clearForm());
        cancelButton.addClassName("cancel-button");

        HorizontalLayout buttons = new HorizontalLayout(saveButton, cancelButton);
        buttons.addClassName("form-actions");

        H3 title = new H3("Kundendaten");
        title.addClassName("customer-form-title");

        Paragraph hint = new Paragraph("Wähle einen Kunden aus oder fülle das leere Formular aus, um einen neuen Datensatz anzulegen.");
        hint.addClassName("customer-form-hint");


        
        VerticalLayout form = new VerticalLayout(title, hint, firstName, lastName, email, company, buttons);
        form.addClassNames("customer-form", "customer-form-panel");
        form.setPadding(true);
        form.setSpacing(true);
        return form;
    }

    private void editCustomer(Customer customer) {
        if (customer == null) {
            clearForm();
            return;
        }

        editedCustomer = customer;
        binder.readBean(editedCustomer);
    }

    private void saveCustomer() {
        if (editedCustomer == null) {
            editedCustomer = new Customer();
        }

        try {
            binder.writeBean(editedCustomer);
            Customer savedCustomer = customerService.save(editedCustomer);
            refreshGrid(savedCustomer);
            Notification.show("Kunde wurde gespeichert");
        } catch (ValidationException exception) {
            Notification.show("Bitte prüfe die Formularfelder");
        }
    }

    private void clearForm() {
        editedCustomer = null;
        binder.readBean(null);
        grid.deselectAll();
    }

    private void refreshGrid() {
        grid.setItems(customerService.findAll());
    }

    private void refreshGrid(Customer customerToSelect) {
        List<Customer> customers = customerService.findAll();
        grid.setItems(customers);

        if (customerToSelect == null || customerToSelect.getId() == null) {
            return;
        }

        customers.stream()
                .filter(customer -> customerToSelect.getId().equals(customer.getId()))
                .findFirst()
                .ifPresent(grid::select);
    }

    @Override
    public String getPageTitle() {
        return "Kunden";
    }
}
