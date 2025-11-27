package edu.northeastern.dharrguptab.huddleup.user.dto;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;

/**
 * Payload for adding a new card detail for a user.
 *
 * @param cardNumber the card number (with no surrounding or interim whitespace)
 * @param nameOnCard the registered name on the card
 * @param expiryMonth the 2-digit numeric expiry month of the card (e.g. "09")
 * @param expiryYear the full 4-digit expiry year of the card (e.g. "2027")
 * @param billingAddress the billing address for the card
 */
public record NewCardDetail(
    String cardNumber,
    String nameOnCard,
    String expiryMonth,
    String expiryYear,
    Address billingAddress) {}
