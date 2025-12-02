package edu.northeastern.dharrguptab.huddleup.user.dto;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import java.util.Date;

public record CardDetail(
    int cardId, String cardNumber, String nameOnCard, Date expiryDate, Address billingAddress) {}
