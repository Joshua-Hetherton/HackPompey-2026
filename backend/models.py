import random
from dataclasses import dataclass, asdict

LORE_POOLS = {
    "elysium": [
        "{symbol} charmed Apollo with a golden lyre and ascended to {area} (+{pct}%).",
        "{symbol} shared ambrosia with the Olympians and earned a villa in {area} (+{pct}%).",
        "{symbol} won the chariot race at Olympus and coasted straight into {area} (+{pct}%).",
        "{symbol} actually sewed Athena's peplos the right way around and was blessed in {area} (+{pct}%).",
        "{symbol} beat Hermes in a sprint and claimed the golden fields of {area} (+{pct}%).",
    ],
    "asphodel": [
        "{symbol} forgot why they came to the Underworld and wandered into {area} ({pct}%).",
        "{symbol} took a few sips of Dionysus' wine, stumbling back down to {area} ({pct}%).",
        "{symbol} celebrated a little too hard at the Dionysia and ended up in {area} ({pct}%).",
        "{symbol} couldn't afford Charon's express ferry and got dropped off in {area} ({pct}%).",
        "{symbol} is just vibing as a wandering shade in {area} ({pct}%).",
    ],
    "fields-of-punishment": [
        "{symbol} sewed the peplos for Athena the wrong way around and was banished to {area} ({pct}%).",
        "{symbol} celebrated too hard at the Dionysia and woke up in {area} ({pct}%).",
        "{symbol} took a few sips of Dionysus' wine, stumbling back down to {area} ({pct}%).",
        "{symbol} got bored of simple life in Elysium, got caught stealing Zeus' lightning bolt, and was thrown to {area} ({pct}%).",
        "{symbol} tried to outsmart Sisyphus and got stuck pushing his boulder in {area} ({pct}%).",
    ],
    "tartarus": [
        "{symbol} took a stab in Prometheus's eye and got hurled straight into {area} ({pct}%).",
        "{symbol} got bored of simple life in Elysium, got caught stealing Zeus' lightning bolt, and was thrown to {area} ({pct}%).",
        "{symbol} insulted Hades' dog Cerberus and was dragged down to {area} ({pct}%).",
        "{symbol} flew way too close to the sun with Icarus and crash-landed in {area} ({pct}%).",
        "{symbol} challenged Ares to a duel and got chained in the depths of {area} ({pct}%).",
    ],
}

@dataclass
class Stock:
    symbol: str
    category: str
    price: float
    pct_change_1d: float
    pct_change_2d: float
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
        template = random.choice(LORE_POOLS[self.id])
        self.fun_lore = template.format(symbol=self.symbol, pct=self.pct_change_1d, area="Elysium")


class AsphodelStock(Stock):
    def __post_init__(self):
        self.id = "asphodel"
        template = random.choice(LORE_POOLS[self.id])
        self.fun_lore = template.format(symbol=self.symbol, pct=self.pct_change_1d, area="Asphodel")

class PunishmentStock(Stock):
    def __post_init__(self):
        self.id = "fields-of-punishment"
        self.current_status = "Sisyphus's Burden"
        template = random.choice(LORE_POOLS[self.id])
        self.fun_lore = template.format(
            symbol=self.symbol, pct=self.pct_change_1d, area="the Fields of Punishment"
        )
    
class TartarusStock(Stock):
    def __post_init__(self):
        self.id = "tartarus"
        self.current_status = "Chained in the Abyss"
        template = random.choice(LORE_POOLS[self.id])
        self.fun_lore = template.format(symbol=self.symbol, pct=self.pct_change_1d, area="Tartarus")
class StockFactory:
    """Creational Factory: builds the right Stock subclass based on daily performance."""

    @staticmethod
    def tier_id(pct_1d: float) -> str:
        if pct_1d >= 1.0:
            return "elysium"
        elif pct_1d >= 0.0:
            return "asphodel"
        elif pct_1d > -1.0:
            return "fields-of-punishment"
        else:
            return "tartarus"

    @staticmethod
    def create_stock(
        symbol: str,
        category: str,
        price: float,
        pct_1d: float,
        pct_2d: float,
        pct_1w: float,
        pct_1y: float,
        pct_prev_1d: float | None = None
    ) -> Stock:
        data = {
            "symbol": symbol,
            "category": category,
            "price": round(price, 2),
            "pct_change_1d": pct_1d,
            "pct_change_2d": pct_2d,
            "pct_change_1w": pct_1w,
            "pct_change_1y": pct_1y,
            "previous_id": StockFactory.tier_id(pct_prev_1d) if pct_prev_1d is not None else "",
        }

        classes = {
            "elysium": ElysiumStock,
            "asphodel": AsphodelStock,
            "fields-of-punishment": PunishmentStock,
            "tartarus": TartarusStock,
        }

        return classes[StockFactory.tier_id(pct_1d)](**data)