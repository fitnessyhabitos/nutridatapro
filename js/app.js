// En js/app.js -> renderDietsListAdmin (y también en renderDietsList si la tienes duplicada)

function renderDietsListAdmin(list) {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '';
    
    // Ordenar
    list.sort((a,b) => (parseInt(a.calories)||9999) - (parseInt(b.calories)||9999));

    list.forEach(d => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // --- COLORES ETIQUETAS ---
        let badgeColor = '#333';
        if(d.category === 'Déficit') badgeColor = '#D32F2F'; // Rojo
        if(d.category === 'Volumen') badgeColor = '#388E3C'; // Verde
        if(d.category === 'Salud') badgeColor = '#F57C00';   // Naranja
        if(d.category === 'Senior') badgeColor = '#00ACC1';  // Cyan/Azul (NUEVO)

        const kcalDisplay = d.isAdLibitum ? 'SACIEDAD' : `${d.calories} kcal`;
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <span class="status-badge" style="background:${badgeColor}; color:white;">${d.category}</span>
                <span class="status-badge" style="border:1px solid rgba(255,255,255,0.3)">${kcalDisplay}</span>
            </div>
            <h3 style="font-size:1.2rem;">${d.name}</h3>
            <p>${d.description ? d.description.substring(0,60) : ''}...</p>
            <button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(d).replace(/'/g, "&apos;")}); openModal("dietViewModal");'>
                <i class="bi bi-eye-fill"></i> Ver Plan
            </button>
        `;
        grid.appendChild(card);
    });
}