// app.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const homeView = document.getElementById('homeView');
    const catalogView = document.getElementById('catalogView');
    const btnGoToRecipes = document.getElementById('btnGoToRecipes');
    const btnGoToSubrecipes = document.getElementById('btnGoToSubrecipes');
    const btnGoToArchive = document.getElementById('btnGoToArchive');
    const btnBackToHome = document.getElementById('btnBackToHome');
    const viewTitleBadge = document.getElementById('viewTitleBadge');
    
    // Catalog DOM
    const recipeGrid = document.getElementById('recipeGrid');
    const categoryFilters = document.getElementById('categoryFilters');
    const searchInput = document.getElementById('searchInput');
    const recipeModal = document.getElementById('recipeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const recipeDetailContainer = document.getElementById('recipeDetailContainer');

    // State
    let currentMode = 'recipes'; // 'recipes', 'subrecipes', or 'archive'
    let currentScale = 1;
    let currentRecipe = null;
    let activeCategory = 'Todas';
    
    // Helper para normalizar texto
    function normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/b/g, 'v')
            .replace(/z/g, 's').replace(/c(?=[ie])/g, 's');
    }

    // --- NAVEGACIÓN SPA ---
    function showHome() {
        catalogView.classList.remove('active-view');
        homeView.classList.add('active-view');
    }

    function showCatalog(mode) {
        currentMode = mode;
        activeCategory = 'Todas';
        searchInput.value = '';
        
        if (mode === 'recipes') viewTitleBadge.innerText = 'La Carta';
        else if (mode === 'subrecipes') viewTitleBadge.innerText = 'Subrecetas';
        else if (mode === 'archive') viewTitleBadge.innerText = 'Archivo Histórico';
        
        homeView.classList.remove('active-view');
        catalogView.classList.add('active-view');
        
        renderCategories();
        filterRecipes();
    }

    btnGoToRecipes.addEventListener('click', () => showCatalog('recipes'));
    btnGoToSubrecipes.addEventListener('click', () => showCatalog('subrecipes'));
    btnGoToArchive.addEventListener('click', () => showCatalog('archive'));
    btnBackToHome.addEventListener('click', showHome);

    // --- CATÁLOGO ---
    function getCurrentData() {
        if (currentMode === 'recipes') {
            return recipeData.filter(r => r.status !== 'archived');
        } else if (currentMode === 'archive') {
            return recipeData.filter(r => r.status === 'archived');
        } else {
            return subRecipeData;
        }
    }

    function renderCategories() {
        const data = getCurrentData();
        const categories = ['Todas', ...new Set(data.map(r => r.category))];
        
        categoryFilters.innerHTML = categories.map(cat => `
            <button class="category-btn ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                activeCategory = e.target.getAttribute('data-category');
                filterRecipes();
            });
        });
    }

    function filterRecipes() {
        const searchTerm = normalizeText(searchInput.value);
        const data = getCurrentData();
        
        const filtered = data.filter(recipe => {
            const matchesCategory = activeCategory === 'Todas' || recipe.category === activeCategory;
            const normalizedName = normalizeText(recipe.name);
            const matchesSearch = normalizedName.includes(searchTerm) || 
                                  (recipe.ingredients && recipe.ingredients.some(ing => normalizeText(ing.name).includes(searchTerm)));
            return matchesCategory && matchesSearch;
        });

        renderGrid(filtered);
    }

    searchInput.addEventListener('input', filterRecipes);

    function renderGrid(recipes) {
        if (recipes.length === 0) {
            recipeGrid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; font-size: 1.2rem;">No se encontraron resultados.</p>';
            return;
        }

        if (searchInput.value.trim() !== '' || activeCategory !== 'Todas') {
            recipeGrid.innerHTML = generateGridHTML(recipes);
        } else {
            let groupedHTML = '';
            // Extraer categorías únicas preservando orden
            const categoriesToRender = [...new Set(recipes.map(r => r.category))];
            
            categoriesToRender.forEach(cat => {
                const categoryRecipes = recipes.filter(r => r.category === cat);
                if (categoryRecipes.length > 0) {
                    groupedHTML += `
                        <div style="grid-column: 1/-1; margin-top: 2rem; margin-bottom: 0.5rem;">
                            <h2 style="color: var(--accent); font-size: 1.8rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem;">${cat}</h2>
                        </div>
                    `;
                    groupedHTML += generateGridHTML(categoryRecipes);
                }
            });
            recipeGrid.innerHTML = groupedHTML;
        }

        document.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                openRecipe(id, currentMode);
            });
        });
    }

    function generateGridHTML(recipes) {
        return recipes.map(recipe => {
            const desc = recipe.description || (typeof menuDescriptions !== 'undefined' ? menuDescriptions[recipe.id] : '');
            return `
            <div class="recipe-card" data-id="${recipe.id}">
                <img src="fotos/${recipe.id}.jpg" onerror="this.onerror=null; this.src='LOGO GQ.png';" alt="${recipe.name}" class="card-img" loading="lazy">
                <div class="card-content">
                    <div class="card-category">${recipe.category}</div>
                    <div class="card-title">${recipe.name}</div>
                    ${desc ? `<div class="card-desc">${desc}</div>` : ''}
                </div>
            </div>
            `;
        }).join('');
    }

    // --- MODAL DETALLE ---
    // Historial de modales (para volver atrás si abrimos subreceta desde receta)
    const modalHistory = [];

    function openRecipe(id, sourceMode) {
        let recipe = recipeData.find(r => r.id === id);
        if (!recipe) recipe = subRecipeData.find(r => r.id === id);
        if (!recipe) return;

        modalHistory.push({ id, sourceMode, scale: currentScale });
        
        currentRecipe = recipe;
        currentScale = 1;
        renderRecipeDetail();
        
        recipeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModalBtn.addEventListener('click', () => {
        // Pop current
        modalHistory.pop();
        if (modalHistory.length > 0) {
            // Ir a la receta anterior
            const prev = modalHistory[modalHistory.length - 1];
            modalHistory.pop(); // Pop it so it gets pushed again in openRecipe
            currentScale = prev.scale;
            openRecipe(prev.id, prev.sourceMode);
        } else {
            // Cerrar modal
            recipeModal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { recipeDetailContainer.innerHTML = ''; }, 300);
        }
    });

    function renderRecipeDetail() {
        if (!currentRecipe) return;

        let backText = modalHistory.length > 1 ? "Volver Atrás" : "Volver al Catálogo";
        closeModalBtn.innerHTML = `<i class="ph ph-arrow-left"></i> ${backText}`;

        const numIngredientes = currentRecipe.ingredients ? currentRecipe.ingredients.length : 0;
        const desc = currentRecipe.description || (typeof menuDescriptions !== 'undefined' ? menuDescriptions[currentRecipe.id] : '');

        recipeDetailContainer.innerHTML = `
            <div class="recipe-header-container">
                <img src="fotos/${currentRecipe.id}.jpg" onerror="this.onerror=null; this.src='LOGO GQ.png';" class="recipe-detail-img" alt="${currentRecipe.name}">
                
                <div class="recipe-header-info">
                    <div class="card-category">${currentRecipe.category}</div>
                    <h2>${currentRecipe.name}</h2>
                    ${desc ? `<p class="recipe-detail-desc">${desc}</p>` : ''}
                    
                    <div class="recipe-meta-grid">
                        <div class="meta-item">
                            <span class="meta-label"><i class="ph ph-cooking-pot"></i> Área</span>
                            <span class="meta-value">${currentRecipe.area || 'Fríos'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label"><i class="ph ph-scales"></i> Ingredientes</span>
                            <span class="meta-value">${numIngredientes}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label"><i class="ph ph-clock"></i> Tiempo</span>
                            <span class="meta-value">${currentRecipe.time || '00:00'} min</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="recipe-body">
                <div>
                    <h3 class="section-title"><i class="ph ph-scales"></i> Ingredientes</h3>
                    
                    <div class="scaler">
                        <span>Escala:</span>
                        <button class="scale-btn" id="btnMinus"><i class="ph ph-minus"></i></button>
                        <span class="scale-value" id="scaleDisplay">x${currentScale}</span>
                        <button class="scale-btn" id="btnPlus"><i class="ph ph-plus"></i></button>
                    </div>

                    <ul class="ingredients-list" id="ingredientsList">
                        ${generateIngredientsHTML()}
                    </ul>
                </div>

                <div>
                    <h3 class="section-title"><i class="ph ph-list-numbers"></i> Procedimiento</h3>
                    <div class="procedure-list">
                        ${currentRecipe.procedure && currentRecipe.procedure.length > 0 ? 
                          currentRecipe.procedure.map((step, index) => `
                            <div class="step" data-step="${index}">
                                <div class="step-checkbox"><i class="ph ph-check"></i></div>
                                <div class="step-text">${step}</div>
                            </div>
                        `).join('') 
                        : '<p style="color: var(--text-secondary)">Procedimiento no disponible o pendiente de cargar.</p>'}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btnMinus').addEventListener('click', () => updateScale(-0.5));
        document.getElementById('btnPlus').addEventListener('click', () => updateScale(0.5));

        document.querySelectorAll('.step').forEach(stepEl => {
            stepEl.addEventListener('click', () => stepEl.classList.toggle('completed'));
        });

        // Eventos para enlaces a subrecetas
        document.querySelectorAll('.subrecipe-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const subId = e.currentTarget.getAttribute('data-subid');
                // Guardar la escala actual en el historial antes de ir a la nueva
                modalHistory[modalHistory.length - 1].scale = currentScale;
                openRecipe(subId, 'subrecipes');
            });
        });
    }

    function generateIngredientsHTML() {
        if (!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) {
            return '<li><span class="ing-name">Ingredientes pendientes de cargar...</span></li>';
        }

        return currentRecipe.ingredients.map(ing => {
            const scaledQty = (ing.qty * currentScale).toFixed(1).replace(/\.0$/, '');
            
            // Buscar si es subreceta
            const normIngName = normalizeText(ing.name);
            const subMatch = subRecipeData.find(s => normalizeText(s.name) === normIngName || normIngName.includes(normalizeText(s.name)));
            
            let nameHTML = `<span class="ing-name">${ing.name}</span>`;
            if (subMatch) {
                nameHTML = `<span class="ing-name subrecipe-link" data-subid="${subMatch.id}" title="Ver preparación">${ing.name} <i class="ph ph-link"></i></span>`;
            }

            return `
                <li>
                    ${nameHTML}
                    <span class="ing-qty">${scaledQty} ${ing.umg}</span>
                </li>
            `;
        }).join('');
    }

    function updateScale(amount) {
        const newScale = currentScale + amount;
        if (newScale >= 0.5 && newScale <= 10) {
            currentScale = newScale;
            document.getElementById('scaleDisplay').innerText = `x${currentScale}`;
            document.getElementById('ingredientsList').innerHTML = generateIngredientsHTML();
        }
    }
});
