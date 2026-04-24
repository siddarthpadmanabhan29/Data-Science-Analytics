package com.kroger.analytics.api.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "households")

public class Household {
    @Id
    @Column(name = "HSHD_NUM")
    private Integer hshdNum;

    @Column(name = "LOYALTY_FLAG")
    private String loyaltyFlag;

    @Column(name = "AGE_RANGE")
    private String ageRange;

    @Column(name = "MARITAL_STATUS")
    private String maritalStatus;

    @Column(name = "INCOME_RANGE")
    private String incomeRange;

    @Column(name = "HOMEOWNER_DESC")
    private String homeownerDesc;

    @Column(name = "HSHD_COMPOSITION")
    private String composition;

    @Column(name = "HH_SIZE")
    private String householdSize;

    @Column(name = "CHILDREN")
    private String children;
}