"""
PayPerAI Smart Contract implementation in Algorand Python (Puya).
This contract handles ALGO payments for AI API usage.
"""
import algopy
from algopy import ARC4Contract, UInt64, String, Account, Txn, gtxn, Global, BoxMap

class PayPerAI(ARC4Contract):
    """
    Smart contract logic for PayPerAI enforcing pay-per-use AI services.
    """

    def __init__(self) -> None:
        """
        Initializes global state and mappings.
        """
        self.owner = algopy.GlobalState(Account)
        self.service_count = algopy.GlobalState(UInt64)
        # Dynamic mapping of service_id to price in microALGO
        self.service_prices = BoxMap(String, UInt64)

    @algopy.arc4.abimethod(create="require")
    def create(self) -> None:
        """
        Initializes the contract. Sets owner and pre-seeds prices.
        """
        self.owner.value = Txn.sender
        
        # Seed 3 services directly into BoxMap
        self.service_prices[String("code_review")] = UInt64(500_000)
        self.service_prices[String("essay_writer")] = UInt64(1_000_000)
        self.service_prices[String("data_analyst")] = UInt64(2_000_000)
        
        self.service_count.value = UInt64(3)

    @algopy.arc4.abimethod
    def purchase_access(self, service_id: String, payment: gtxn.PaymentTransaction) -> algopy.arc4.Bool:
        """
        Validates the payment for the specific AI service.
        Must be sent inside a transaction group where index 0 is a payment to the contract.
        """
        # Validate payment receiver
        assert payment.receiver == Global.current_application_address, "Payment must be to contract"
        
        # Validate service exists
        assert service_id in self.service_prices, "INVALID_SERVICE"
        
        # Validate sufficient amount paid
        price = self.service_prices[service_id]
        assert payment.amount >= price, "INSUFFICIENT_FUNDS"
        
        # Emit log for indexer to capture who bought what: "buyer_address:service_id"
        algopy.log(Txn.sender.bytes + algopy.Bytes(b":") + service_id.bytes)
        
        return algopy.arc4.Bool(True)

    @algopy.arc4.abimethod
    def get_service_price(self, service_id: String) -> UInt64:
        """
        Reads and returns price from BoxMap.
        Returns 0 if service_id not found (do not reject).
        """
        if service_id in self.service_prices:
            return self.service_prices[service_id]
        return UInt64(0)

    @algopy.arc4.abimethod
    def update_price(self, service_id: String, new_price: UInt64) -> algopy.arc4.Bool:
        """
        Allows the owner to update the price of a service.
        """
        assert Txn.sender == self.owner.value, "UNAUTHORIZED"
        self.service_prices[service_id] = new_price
        return algopy.arc4.Bool(True)

    @algopy.arc4.abimethod
    def withdraw(self, amount: UInt64) -> algopy.arc4.Bool:
        """
        Allows the owner to withdraw ALGO collected by the contract.
        """
        assert Txn.sender == self.owner.value, "UNAUTHORIZED"
        algopy.itxn.Payment(
            receiver=self.owner.value,
            amount=amount
        ).submit()
        return algopy.arc4.Bool(True)
