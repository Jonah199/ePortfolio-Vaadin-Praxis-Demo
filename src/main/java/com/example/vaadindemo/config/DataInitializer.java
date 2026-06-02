package com.example.vaadindemo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.vaadindemo.customer.Customer;
import com.example.vaadindemo.customer.CustomerService;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CustomerService customerService;

    public DataInitializer(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Override
    public void run(String... args) {
        if (customerService.count() > 0) {
            return;
        }

        customerService.save(new Customer("Anna", "Meyer", "anna.meyer@example.com", "Meyer Consulting"));
        customerService.save(new Customer("Ben", "Schmidt", "ben.schmidt@example.com", "Schmidt IT"));
        customerService.save(new Customer("Clara", "Weber", "clara.weber@example.com", "Weber Design"));
        customerService.save(new Customer("David", "Fischer", "david.fischer@example.com", "Fischer Logistik"));
        customerService.save(new Customer("Elena", "Hoffmann", "elena.hoffmann@example.com", "Hoffmann Bildung"));
    }
}
