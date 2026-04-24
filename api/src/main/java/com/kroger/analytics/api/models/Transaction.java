package com.kroger.analytics.api.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "transactions")

public class Transaction {
    @Id
    @Column(name = "BASKET_NUM")
    private Long basketNum;

    @Column(name = "HSHD_NUM")
    private Integer hshdNum;

    @Column(name = "PURCHASE_DATE")
    private String date;

    @Column(name = "PRODUCT_NUM")
    private Long productNum;

    @Column(name = "SPEND")
    private Double spend;

    @Column(name = "UNITS")
    private Integer units;

    @Column(name = "STORE_REGION")
    private String store;

    @Column(name = "WEEK_NUM")
    private Integer weekNum;

    @Column(name = "YEAR")
    private Integer year;

    //This reaches into product table and get the details of department and commodity in terms of grouping
    @ManyToOne

    @JoinColumn(name = "PRODUCT_NUM", referencedColumnName = "PRODUCT_NUM", insertable = false, updatable = false)

    private Product product;
}