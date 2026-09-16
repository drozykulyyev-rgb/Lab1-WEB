const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
const form = document.getElementById('point-form');
const checkboxes = document.querySelectorAll('input[name="r"]');
const zoom = document.getElementById('zoom');

let history = JSON.parse(localStorage.getItem('points22721')) || [];
let currentPoint = null;



function getR() {
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            return Number(checkbox.value);
        }
    }
}



function draw(point) {
    const r = getR() || 1;
    const center = 250;
    const scale = 170 / r * (zoom.value / 100);

    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, 500, 500);

    ctx.save();
    ctx.translate(center, center);


    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(0, -r * scale, r * scale, r * scale);

 
 
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * scale / 2, Math.PI / 2, Math.PI);
    ctx.fill();

 
 
 
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * scale, 0);
    ctx.lineTo(0, r * scale);
    ctx.fill();

 
    ctx.strokeStyle = '#222';
    ctx.beginPath();

    ctx.moveTo(-220, 0);
    ctx.lineTo(220, 0);

    ctx.moveTo(0, -220);
    ctx.lineTo(0, 220);

    ctx.stroke();

    ctx.font = '14px Arial';
    ctx.fillStyle = '#222';
    ctx.fillText('X', 225, 15);
    ctx.fillText('Y', 8, -225);

 
 
    const marks = [-r, -r / 2, r / 2, r];

    for (const value of marks) {
        const x = value * scale;
        const y = -value * scale;

        ctx.beginPath();

        ctx.moveTo(x, -4);
        ctx.lineTo(x, 4);

        ctx.moveTo(-4, y);
        ctx.lineTo(4, y);

        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillText(String(value), x, 18);

        ctx.textAlign = 'left';
        ctx.fillText(String(value), 8, y + 5);
    }



    if (point) {
        ctx.beginPath();
        ctx.arc(
            point.x * scale,
            -point.y * scale,
            6,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = checkHit(point.x, point.y, r)
            ? 'green'
            : 'red';

        ctx.fill();
    }

    ctx.restore();
}




function validate(input, min, max, errorId) {
    const text = input.value.trim().replace(',', '.');
    const value = Number(text);
    let error = '';

    if (text === '' || !Number.isFinite(value)) {
        error = 'Введите число';
    } else if (value < min || value > max) {
        error = `Допустимо от ${min} до ${max}`;
    }

    document.getElementById(errorId).textContent = error;
    input.setAttribute('aria-invalid', error !== '');

    return error ? null : value;
}



function checkHit(x, y, r) {
    const rectangle =
        x >= 0 && x <= r &&
        y >= 0 && y <= r;

    const circle =
        x <= 0 && y <= 0 &&
        x * x + y * y <= r * r / 4;

    const triangle =
        x >= 0 && y <= 0 &&
        y >= x - r;

    return rectangle || circle || triangle;
}




function showHistory() {
    const table = document.getElementById('results');
    table.innerHTML = '';

    for (const item of history) {
        const row = table.insertRow();

        row.insertCell().textContent = item.x;
        row.insertCell().textContent = item.y;
        row.insertCell().textContent = item.r;

        const result = row.insertCell();
        result.textContent = item.hit ? 'Попадание' : 'Промах';
        result.className = item.hit ? 'hit' : 'miss';

        row.insertCell().textContent =
            new Date(item.time).toLocaleString('ru-RU');
    }
}



checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            checkboxes.forEach(item => {
                if (item !== this) {
                    item.checked = false;
                }
            });
        } else if (!getR()) {
            this.checked = true;
        }

        draw(currentPoint);
    });
});





zoom.addEventListener('input', function () {
    document.getElementById('zoom-value').textContent =
        zoom.value + '%';

    draw(currentPoint);
});





form.addEventListener('submit', function (event) {
    event.preventDefault();

    const x = validate(
        document.getElementById('x'), -3, 5, 'x-error'
    );

    const y = validate(
        document.getElementById('y'), -3, 3, 'y-error'
    );

    const r = getR();

    if (x === null || y === null || !r) {
        return;
    }

    const point = {
        x: x,
        y: y,
        r: r,
        hit: checkHit(x, y, r),
        time: new Date().toISOString()
    };

    currentPoint = point;
    history.unshift(point);

    localStorage.setItem(
        'points22721',
        JSON.stringify(history)
    );

    showHistory();
    draw(point);
});




document.getElementById('clear').addEventListener('click', function () {
    history = [];
    currentPoint = null;

    localStorage.removeItem('points22721');

    showHistory();
    draw();
});




showHistory();
draw();