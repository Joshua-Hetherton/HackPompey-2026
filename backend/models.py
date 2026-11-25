from dataclasses import dataclass, asdict


@dataclass
class Stock:
    symbol: str
    category: str
    price: float
    pct_change_1d: float
    pct_change_1w: float
    pct_change_1y: float
    id: str = ""
    current_status: str = ""
    fun_lore: str = ""
    previous_id: str=""

    def __post_init__(self) -> None:
        pass

    def to_dict(self) -> dict:
        return asdict(self)


class ElysiumStock(Stock):
    def __post_init__(self):
        self.id = "elysium"
        self.current_status = "Blessed by Apollo"
        self.fun_lore = f"{self.symbol} ascends in golden light (+{self.pct_change_1d}% today)."


class AsphodelStock(Stock):
    def __post_init__(self):
        self.id = "asphodel"
        self.current_status = "Wandering Shade"
        self.fun_lore = f"{self.symbol} drifts aimlessly through the mist ({self.pct_change_1d}% today)."


class PunishmentStock(Stock):
    def __post_init__(self):
        self.id = "fields-of-punishment"
        self.current_status = "Sisyphus's Burden"
        self.fun_lore = f"{self.symbol} is slipping down the slope ({self.pct_change_1d}% today)."


class TartarusStock(Stock):
    def __post_init__(self):
        self.id = "tartarus"
        self.current_status = "Chained in the Abyss"
        self.fun_lore = f"{self.symbol} plunges into the crimson depths ({self.pct_change_1d}% today)."

class StockFactory:
    """Creational Factory: builds the right Stock subclass based on daily performance."""

    @staticmethod
    def tier_id(pct_1d: float) -> str:
        if pct_1d >= 2.0:
            return "elysium"
        elif pct_1d > -1.0:
            return "asphodel"
        elif pct_1d > -4.0:
            return "fields-of-punishment"
        else:
            return "tartarus"
    def create_stock(
        symbol: str,
        category: str,
        price: float,
        pct_1d: float,
        pct_1w: float,
        pct_1y: float,
        pct_prev_1d: float | None = None
    ) -> Stock:
        data = {
            "symbol": symbol,
            "category": category,
            "price": round(price, 2),
            "pct_change_1d": pct_1d,
            "pct_change_1w": pct_1w,
            "pct_change_1y": pct_1y,
            "previous_id": StockFactory.tier_id(pct_1d) if pct_prev_1d is not None else "",
        }

        classes = {
            "elysium": ElysiumStock,
            "asphodel": AsphodelStock,
            "fields-of-punishment": PunishmentStock,
            "tartarus": TartarusStock,
        }

        return classes[StockFactory.tier_id(pct_1d)](**data)