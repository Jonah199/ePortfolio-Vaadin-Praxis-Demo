package com.example.vaadindemo.customer;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> findAll() {
        return customerRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }

    public long count() {
        return customerRepository.count();
    }
}
