package com.kroger.analytics.api.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "products")

public class Product {
    @Id
    @Column(name = "PRODUCT_NUM")
    private Long productNum;

    @Column(name = "DEPARTMENT")
    private String department;

    @Column(name = "COMMODITY")
    private String commodity;

    @Column(name = "BRAND_TY")
    private String brandType;

    @Column(name = "NATURAL_ORGANIC_FLAG")
    private String organicFlag;
}