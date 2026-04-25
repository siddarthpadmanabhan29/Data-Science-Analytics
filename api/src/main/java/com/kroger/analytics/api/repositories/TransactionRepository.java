package com.kroger.analytics.api.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.kroger.analytics.api.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t JOIN FETCH t.product WHERE t.hshdNum = :hshdNum ORDER BY t.basketNum ASC, t.date ASC")
    List<Transaction> findByHshdNumOrderByBasketNumAscDateAsc(@Param("hshdNum") Integer hshdNum);
}


