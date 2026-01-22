// === INVESTIMENTOS - Sistema de Lista de Compras ===
const INVESTIMENTOS_KEY = 'hubfest_investimentos';

// Inicializar investimentos
function initInvestimentos() {
    if (!localStorage.getItem(INVESTIMENTOS_KEY)) {
        localStorage.setItem(INVESTIMENTOS_KEY, JSON.stringify([]));
    }
}

function getInvestimentos() {
    return JSON.parse(localStorage.getItem(INVESTIMENTOS_KEY) || '[]');
}

function saveInvestimentos(investimentos) {
    localStorage.setItem(INVESTIMENTOS_KEY, JSON.stringify(investimentos));
    renderInvestimentos();
}

// Preview de imagem
window.previewImage = function (input) {
    const preview = document.getElementById('image-preview');
    const img = document.getElementById('preview-img');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Abrir modal de investimento
window.openInvestimentoModal = function (id = null) {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-investimento');
    const title = document.getElementById('modal-investimento-title');
    const form = document.getElementById('form-investimento');

    form.reset();
    document.getElementById('image-preview').style.display = 'none';

    if (id) {
        const investimentos = getInvestimentos();
        const item = investimentos.find(i => i.id === id);
        if (!item) return;

        title.innerText = 'Editar Investimento';
        document.getElementById('investimento-id').value = id;
        document.getElementById('investimento-nome').value = item.nome;
        document.getElementById('investimento-valor').value = item.valor;
        document.getElementById('investimento-obs').value = item.obs || '';

        if (item.foto) {
            document.getElementById('preview-img').src = item.foto;
            document.getElementById('image-preview').style.display = 'block';
        }
    } else {
        title.innerText = 'Novo Investimento';
        document.getElementById('investimento-id').value = '';
    }

    modal.classList.add('active');
    document.getElementById('modal-festa').style.display = 'none';
    document.getElementById('modal-tarefa').style.display = 'none';
    modalContent.style.display = 'flex';
}

// Salvar investimento
document.addEventListener('DOMContentLoaded', () => {
    initInvestimentos();

    const formInvestimento = document.getElementById('form-investimento');
    if (formInvestimento) {
        formInvestimento.addEventListener('submit', (e) => {
            e.preventDefault();

            const id = document.getElementById('investimento-id').value;
            const fotoInput = document.getElementById('investimento-foto');
            let investimentos = getInvestimentos();

            const itemData = {
                id: id || Date.now().toString(),
                nome: document.getElementById('investimento-nome').value,
                valor: parseFloat(document.getElementById('investimento-valor').value),
                obs: document.getElementById('investimento-obs').value,
                selecionado: false,
                foto: null
            };

            // Se existe foto nova
            if (fotoInput.files && fotoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    itemData.foto = e.target.result;

                    if (id) {
                        investimentos = investimentos.map(i => i.id === id ? { ...itemData, selecionado: i.selecionado } : i);
                    } else {
                        investimentos.push(itemData);
                    }

                    saveInvestimentos(investimentos);
                    closeModals();
                };
                reader.readAsDataURL(fotoInput.files[0]);
            } else {
                // Se não tem foto nova, mantém a antiga (se editando)
                if (id) {
                    const oldItem = investimentos.find(i => i.id === id);
                    itemData.foto = oldItem ? oldItem.foto : null;
                    itemData.selecionado = oldItem ? oldItem.selecionado : false;
                    investimentos = investimentos.map(i => i.id === id ? itemData : i);
                } else {
                    investimentos.push(itemData);
                }

                saveInvestimentos(investimentos);
                closeModals();
            }
        });
    }
});

// Renderizar investimentos
function renderInvestimentos() {
    const investimentos = getInvestimentos();
    const container = document.getElementById('lista-investimentos');
    if (!container) return;

    if (investimentos.length === 0) {
        container.innerHTML = '<div class="card empty-state-card"><p>Nenhum item cadastrado ainda.</p></div>';
        updateTotalInvestimento();
        return;
    }

    container.innerHTML = investimentos.map(item => `
        <div class="investment-card ${item.selecionado ? 'selected' : ''}">
            <div class="investment-check">
                <input type="checkbox" ${item.selecionado ? 'checked' : ''} 
                       onchange="toggleInvestimento('${item.id}')" 
                       id="check-${item.id}">
            </div>
            <div class="investment-image">
                ${item.foto ? `<img src="${item.foto}" alt="${item.nome}">` : '<div class="no-image"><i data-feather="image"></i></div>'}
            </div>
            <div class="investment-info">
                <h4>${item.nome}</h4>
                ${item.obs ? `<p>${item.obs}</p>` : ''}
                <div class="investment-price">R$ ${item.valor.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="investment-actions">
                <button class="task-btn edit" onclick="openInvestimentoModal('${item.id}')" title="Editar">
                    <i data-feather="edit-2" style="width:14px"></i>
                </button>
                <button class="task-btn delete" onclick="deleteInvestimento('${item.id}')" title="Excluir">
                    <i data-feather="trash-2" style="width:14px"></i>
                </button>
            </div>
        </div>
    `).join('');

    feather.replace();
    updateTotalInvestimento();
}

// Toggle seleção
window.toggleInvestimento = function (id) {
    let investimentos = getInvestimentos();
    investimentos = investimentos.map(i =>
        i.id === id ? { ...i, selecionado: !i.selecionado } : i
    );
    saveInvestimentos(investimentos);
}

// Deletar item
window.deleteInvestimento = function (id) {
    if (confirm('Deseja excluir este item?')) {
        let investimentos = getInvestimentos();
        investimentos = investimentos.filter(i => i.id !== id);
        saveInvestimentos(investimentos);
    }
}

// Atualizar total
function updateTotalInvestimento() {
    const investimentos = getInvestimentos();
    const selecionados = investimentos.filter(i => i.selecionado);
    const total = selecionados.reduce((sum, item) => sum + item.valor, 0);

    const countEl = document.getElementById('selected-count');
    const valueEl = document.getElementById('total-value');

    if (countEl) countEl.innerText = `${selecionados.length} ${selecionados.length === 1 ? 'item selecionado' : 'itens selecionados'}`;
    if (valueEl) valueEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}
