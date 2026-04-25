package com.kroger.analytics.api.controllers;

import com.kroger.analytics.api.models.Transaction;
import com.kroger.analytics.api.repositories.TransactionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {
    private final TransactionRepository repository;

    public TransactionController(TransactionRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/household/{hshdNum}")
    public List<Transaction> getTransactionsByHousehold(@PathVariable Integer hshdNum) {
        return repository.findByHshdNumOrderByBasketNumAscDateAsc(hshdNum);
    }
}
