package com.kroger.analytics.api.repositories;

import com.kroger.analytics.api.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByHshdNumOrderByDateAsc(Integer hshdNum);
}


