import json
import random
import datetime


# --- Configurações ---
# Gera um histórico falso para os gráficos parecerem "vivos" logo no início
def gerar_historico(valor_atual, pontos=10, volatilidade=0.5):
    historico = []
    valor = valor_atual
    for _ in range(pontos):
        # Cria variações passadas baseadas no valor atual
        valor = valor + random.uniform(-volatilidade, volatilidade)
        historico.insert(0, round(valor, 2))  # Insere no início
    return historico


# --- Dados do Relatório (Matriz Estática) ---
market_matrix = [
    {"ticker": "NVDA", "company": "Nvidia Corp", "cat": "Infra", "impact": "Critical", "impact_class": "text-green",
     "risk": "High (Valuation)", "risk_class": "risk-high"},
    {"ticker": "MSFT", "company": "Microsoft", "cat": "Cloud/AI", "impact": "High", "impact_class": "text-green",
     "risk": "Medium", "risk_class": "risk-med"},
    {"ticker": "CEG", "company": "Constellation", "cat": "Energy", "impact": "Structural", "impact_class": "text-green",
     "risk": "Low", "risk_class": "risk-low"},
    {"ticker": "CHGG", "company": "Chegg Inc", "cat": "EdTech", "impact": "Negative", "impact_class": "text-red",
     "risk": "Extreme", "risk_class": "risk-high"},
    {"ticker": "FVRR", "company": "Fiverr", "cat": "Gig Econ", "impact": "Disruptive", "impact_class": "text-red",
     "risk": "High", "risk_class": "risk-high"},
]

# --- Geração dos Valores Atuais ---
cer_val = round(random.uniform(0.45, 0.65), 2)
rci_val = round(random.uniform(0.70, 0.90), 2)
hsd_val = round(random.uniform(15.0, 25.0), 1)
energy_price = round(random.uniform(80.0, 150.0), 2)
vacancy_rate = round(random.uniform(1.0, 3.0), 1)
vc_funding = round(random.uniform(80.0, 100.0), 1)

# --- Estrutura JSON Final ---
dados = {
    "metadata": {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "status": "MARKET OPEN"
    },
    "market_ticker": [
        {"symbol": "NVDA", "price": 890.50 + random.uniform(-5, 5), "change": "+2.4%"},
        {"symbol": "AMD", "price": 170.20 + random.uniform(-2, 2), "change": "-0.5%"},
        {"symbol": "MSFT", "price": 415.10 + random.uniform(-3, 3), "change": "+1.1%"},
        {"symbol": "CEG", "price": 180.30 + random.uniform(-1, 2), "change": "+3.2%"},
        {"symbol": "VST", "price": 65.40 + random.uniform(-0.5, 1), "change": "+4.0%"}
    ],
    "dashboard_metrics": {
        # Valores Únicos (para Texto)
        "cer_current": cer_val,
        "rci_current": rci_val,
        "hsd_current": hsd_val,
        "energy_price": energy_price,

        # Históricos (para Gráficos de Linha) - O Python gera o array para o JS desenhar
        "cer_history": gerar_historico(cer_val, volatilidade=0.02),
        "hsd_history_hardware": gerar_historico(hsd_val, volatilidade=1.5),
        "hsd_history_software": gerar_historico(hsd_val - 15, volatilidade=0.5),  # Software perfomando pior

        # Dados para Gráficos de Barra
        "rci_data": [vc_funding, 0],  # Placeholder estrutura
        "energy_data": [vacancy_rate, energy_price]
    },
    "market_matrix": market_matrix,  # Adicionamos a tabela aqui
    "news_feed": [
        {"time": "14:05", "tag": "ALERTA", "text": "Volume de opções de venda (Puts) em SMH atinge nível crítico."},
        {"time": "13:45", "tag": "CAPEX", "text": "Microsoft anuncia expansão de data center nuclear na Virgínia."},
        {"time": "12:30", "tag": "MERCADO", "text": "Nvidia mantém margem bruta acima de 75% no Q3."}
    ]
}

# Salvar o arquivo
with open('dashboard_data.json', 'w') as f:
    json.dump(dados, f, indent=4)

print("Dados completos (Tabela + Gráficos) gerados com sucesso.")