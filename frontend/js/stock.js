'use strict';

const API_BASE_URL = window.location.port === '9000' ? '/api' : 'http://127.0.0.1:9000/api';

let currentCategory = "tech";
let currentTimeframe = "1d";
let latestRequest = 0;
let currentStocks = [];


const TIERS = {
    "elysium": {
        name: "Elysium",
    },
    "asphodel": {
        name: "Asphodel",
    },
    "fields-of-punishment": {
        name: "Fields of Punishment",
    },
    "tartarus": {
        name: "Tartarus",
    }
}

const COLUMNS=4;
const ROW_HEIGHT=100;
const STAGGER=25;
const HEADER_SPACE=170;
const MIN_TIER_HEIGHT = 560;
const TIER_IDS = Object.keys(TIERS);


const $ = (selector) => document.querySelector(selector);

function do_format_change(change) {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
}

function show_Status(message, isError = false) {
    const status = $("#status");
    status.textContent = message;
    status.hidden = false;
}

async function Load_stock_data() {
    const requestId = ++latestRequest;
    try {
        const response = await fetch(`${API_BASE_URL}/market/${currentCategory}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (requestId !== latestRequest) return;
        if(!data.souls.length) {
            currentStocks = [];
            $("#stock-layer").replaceChildren();
            show_Status("No market data came back. Try refreshing in a minute.");
            return;
        }
        currentStocks = data.souls;
        render_stocks(data.souls);




    } catch (error) {
        if (requestId !== latestRequest) return;
        show_Status("An error occurred while loading stock data.", true);
        console.error("Error fetching stock data:", error);
    }
}

function render_stocks(stocks, animateMovements = true) {
    const layer=$("#stock-layer");
    const template=$("#stock-template");
    const changeKey = `pct_change_${currentTimeframe}`;

    const sorted = stocks.filter((stock) => TIER_IDS.includes(stock.id))
        .sort((a, b) => b[changeKey] - a[changeKey]);

    layer.replaceChildren();
    const counts= Object.fromEntries(Object.keys(TIERS).map((tier) => [tier, 0]));
    sorted.forEach((stock) => {
        counts[stock.id]++;
    });

    TIER_IDS.forEach((tier) => {
        const rows = Math.ceil(counts[tier] / COLUMNS);
        const height = Math.max(MIN_TIER_HEIGHT, HEADER_SPACE + rows * ROW_HEIGHT + STAGGER + 40);
        $(`#${tier}`).style.minHeight = `${height}px`;
    });


    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            if (entry.target.dataset.endTop) startMove(entry.target);
        });
    }, { threshold: 0.6 });


    const placed= Object.fromEntries(Object.keys(TIERS).map((tier) => [tier, 0]));



    sorted.forEach((stock) => {
        const node=template.content.firstElementChild.cloneNode(true);
        const tierElement=$(`#${stock.id}`);

        // Placing stock in the correct position based on its tier and order
        const slot=placed[stock.id]++;
        const row=Math.floor(slot / COLUMNS);
        const col=slot % COLUMNS;

        const inRow=Math.min(COLUMNS, counts[stock.id] - row * COLUMNS);
        const left=(col + 0.5) * (100 / inRow);
        const endTop = tierElement.offsetTop + HEADER_SPACE + row * ROW_HEIGHT + (col % 2) * STAGGER;

        
        //Contents of the stock card

        const change = stock[changeKey];
        node.classList.add(change >= 0 ? 'up' : 'down');
        if (inRow > 1 && col === 0) node.classList.add('edge-left');
        if (inRow > 1 && col === inRow - 1) node.classList.add('edge-right');
        node.querySelector('.stock-identifier').textContent = stock.symbol.replace('-USD', '');
        node.querySelector('.stock-change').textContent = do_format_change(change);
        node.querySelector('.bubble-text').textContent = stock.fun_lore;
        node.setAttribute('aria-label', `${stock.symbol}, ${stock.current_status}, ${do_format_change(change)} over ${currentTimeframe.toUpperCase()}`);
        node.addEventListener('click', () => node.classList.toggle('open'));

        const moved = animateMovements && TIER_IDS.includes(stock.previous_id) && stock.previous_id !== stock.id;
        node.style.left = `${left}%`;
        if (moved) {
            const oldTier = $(`#${stock.previous_id}`);
            const fell = TIER_IDS.indexOf(stock.id) > TIER_IDS.indexOf(stock.previous_id);
            const startTop = fell
                ? oldTier.offsetTop + oldTier.offsetHeight - 70
                : oldTier.offsetTop + 90;
            node.style.top = `${startTop}px`;
            node.dataset.endTop = `${endTop}px`;
            node.dataset.moveText = `${fell ? 'Fell' : 'Climbed'} from ${TIERS[stock.previous_id].name} into ${TIERS[stock.id].name}.`;
        } else {
            node.style.top = `${endTop}px`;
        }

        layer.appendChild(node);
        observer.observe(node);
    });
}

function startMove(node) {
    node.querySelector('.bubble-movement').textContent = node.dataset.moveText;

    setTimeout(() => {
        node.style.top = node.dataset.endTop;
    }, 300);
}

document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
        currentCategory = button.dataset.category;
        currentStocks = [];
        document.querySelectorAll("[data-category]").forEach((categoryButton) => {
            const isActive = categoryButton === button;
            categoryButton.classList.toggle("is-active", isActive);
            categoryButton.setAttribute("aria-pressed", String(isActive));
        });
        $("#stock-layer").replaceChildren();
        Load_stock_data();
    });
});

document.querySelectorAll("[data-timeframe]").forEach((button) => {
    button.addEventListener("click", () => {
        currentTimeframe = button.dataset.timeframe;
        document.querySelectorAll("[data-timeframe]").forEach((timeframeButton) => {
            const isActive = timeframeButton === button;
            timeframeButton.classList.toggle("is-active", isActive);
            timeframeButton.setAttribute("aria-pressed", String(isActive));
        });
        render_stocks(currentStocks, false);
    });
});

Load_stock_data();