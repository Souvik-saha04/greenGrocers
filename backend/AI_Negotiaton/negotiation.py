from decimal import Decimal
from .models import NegotiationHistory

MAX_NEGOTIATION_ROUNDS = 5
DISCOUNT_STEP = Decimal("50")
MIN_COUNTER_GAP = Decimal("20")

def is_valid_offer(user_price, min_price):
    return user_price >= min_price


def calculate_counter_price(current_price, min_price,user_price):
    counter = (current_price + user_price) / 2
    return max(counter, min_price)


def negotiate_price(*, user, user_price, product, round_no):
    # Convert to Decimal for consistent comparison
    user_price = Decimal(str(user_price))
    
    last_round = NegotiationHistory.objects.filter(
        user=user,
        product=product,
        status="ACTIVE"
    ).order_by('-round_no').first()

    current_price = (
        last_round.system_price
        if last_round
        else product.price_per_unit
    )

    # ACCEPT - if user meets minimum price
    if is_valid_offer(user_price, product.min_price):
        return {
            "decision": "ACCEPT",
            "price": user_price,
        }

    # COUNTER - if still have rounds remaining
    if round_no < MAX_NEGOTIATION_ROUNDS:
        counter_price = calculate_counter_price(current_price, product.min_price,user_price)

        # If gap too small, just reject but keep negotiation active
        if current_price - counter_price < MIN_COUNTER_GAP:
            return {
                "decision": "REJECT",
                "price": current_price,
            }

        return {
            "decision": "COUNTER",
            "price": counter_price,
        }

    # REJECT - max rounds reached, end negotiation
    return {
        "decision": "REJECT",
        "price": current_price,
    }