'use strict';

const API_BASE_URL = window.location.port === '9000' ? 'http://localhost:9000/api' : '/api';

const Category="tech";


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
const ROW_HeIGHT=100;
const STAGGER=25;
const HEADER_SPACE=170;
const MIN_TIER_HEIGHT = 560;


const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector) => document.querySelector(selector);

function do_format_change(change) { 
    const status=$("#status");
    return '${sign}${change.toFixed(2)}%';

}

function show_Status(message, isError=false) {
    const status=$("#status");
    status.textContent=message;
}

async function Load_stock_data() {
    try {
        const response = await fetch(`${API_BASE_URL}/stocks/${Category}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if(!data.souls.length) {
            show_Status("No market data came back. Try refreshing in a minute.");
            return;
        }
        render_stocks(data.souls);




    } catch (error) {
        show_Status("An error occurred while loading stock data.", true);
        console.error("Error fetching stock data:", error);
    }
}

function render_stocks(stocks) {
    const layer=$("#stock-layer");
    const template=$("#stock-template");

    const sorted = stocks.filter((stock) => TIERS.includes(stock.id))
        .sort((a, b) => b.pct_change_1d - a.pct_change_1d);

    const counts= Object.fromEntries(Object.keys(TIERS).map((tier) => [tier, 0]));
    sorted.forEach((stock) => {
        counts[stock.id]++;
    });

    TIERS.forEach((tier) => {
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
        const node=template.content.firstelementchild.cloneNode(true);
        const tierElement=$(`#${stock.id}`);

        // Placing stock in the correct position based on its tier and order
        const slot=placed[stock.id]++;
        const row=Math.floor(slot / COLUMNS);
        const col=slot % COLUMNS;

        const inRow=Math.min(CoLUMNS, counts[stock.id] - row * COLUMNS);
        const left=(col + 0.5) * (100 / inRow);
        const endTop = tierElement.offsetTop + HEADER_SPACE + row * ROW_HEIGHT + (col % 2) * STAGGER;

        
        //Contents of the stock card

        node.classList.add(stock.pct_change_1d >= 0 ? 'up' : 'down');
        if (inRow > 1 && col === 0) node.classList.add('edge-left');
        if (inRow > 1 && col === inRow - 1) node.classList.add('edge-right');
        node.querySelector('.stock-identifier').textContent = stock.symbol.replace('-USD', '');
        node.querySelector('.stock-change').textContent = formatChange(stock.pct_change_1d);
        node.querySelector('.bubble-text').textContent = stock.fun_lore;
        node.setAttribute('aria-label', `${stock.symbol}, ${stock.current_status}, ${formatChange(stock.pct_change_1d)} today`);
        node.addEventListener('click', () => node.classList.toggle('open'));

        const moved = TIERS.includes(stock.previous_id) && stock.previous_id !== stock.id;
        node.style.left = `${left}%`;
        if (moved) {
            const oldTier = $(`#${stock.previous_id}`);
            const fell = TIERS.indexOf(stock.id) > TIERS.indexOf(stock.previous_id);
            const startTop = fell
                ? oldTier.offsetTop + oldTier.offsetHeight - 70
                : oldTier.offsetTop + 90;
            node.style.top = `${startTop}px`;
            node.dataset.endTop = `${endTop}px`;
            node.dataset.moveText = `${fell ? 'Fell' : 'Climbed'} from ${TIER_NAMES[stock.previous_id]} into ${TIER_NAMES[stock.id]}.`;
        } else {
            node.style.top = `${endTop}px`;
        }

        layer.appendChild(node);
        observer.observe(node);
    });
}

function startMove(node) {
    node.querySelector('.bubble-movement').textContent = node.dataset.moveText;

    const arrive = () => {
        node.classList.add('open');
        setTimeout(() => node.classList.remove('open'), 6000);
    };

    setTimeout(() => {
        node.style.top = node.dataset.endTop;
        if (prefersReducedMotion) {
            arrive();
        } else {
            node.addEventListener('transitionend', arrive, { once: true });
        }
    }, 300);
}

loadStocks();