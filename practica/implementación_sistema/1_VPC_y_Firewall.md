# 🧱 Guía 1 – Creación de VPC y Reglas de Firewall

**Objetivo:** Crear una red personalizada en GCP con control de tráfico básico, para alojar las instancias de backend y servicios auxiliares de la aplicación "Evaluador de Crédito".

---

## 📌 Paso 1: Crear la VPC personalizada

1. Abre la consola de GCP:  
   https://console.cloud.google.com/

2. En el menú lateral, ve a **"VPC Network" → "VPC Networks"**.

3. Haz clic en **"CREATE VPC NETWORK"**.

4. Completa el formulario:

| Campo              | Valor sugerido               |
|--------------------|------------------------------|
| Name               | `vpc-evaluador`              |
| Subnet creation mode | Custom                     |

5. Crea una subnet:

| Campo            | Valor sugerido         |
|------------------|------------------------|
| Subnet name      | `subnet-central`       |
| Region           | `us-central1` (o la que uses) |
| IP range         | `10.10.0.0/24`         |
| Private Google Access | `ON`              |

6. Asegúrate de que el enrutamiento dinámico sea **regional**.

7. Haz clic en **"Create"**.

---

## 📌 Paso 2: Crear reglas de firewall

### 🔒 2.1. Permitir tráfico HTTP y HTTPS desde internet

Esto permitirá que el balanceador pueda acceder a las VMs.

1. En el menú de la red VPC, ve a **"Firewall rules"** → **"Create Firewall Rule"**.

2. Completa con:

| Campo                 | Valor                             |
|-----------------------|-----------------------------------|
| Name                  | `fw-allow-http`                   |
| Network               | `vpc-evaluador`                   |
| Direction             | Ingress                           |
| Action                | Allow                             |
| Targets               | All instances in the network      |
| Source IP ranges      | `0.0.0.0/0`                       |
| Protocols and ports   | Check "Specified protocols and ports" → HTTP (80) |

3. Repite para HTTPS (puerto 443) si usarás TLS.

---

### 🔄 2.2. Permitir tráfico interno entre servicios

1. Crea una regla llamada `fw-allow-internal`.

2. Configura con:

| Campo                 | Valor                             |
|-----------------------|-----------------------------------|
| Source IP ranges      | `10.10.0.0/24`                    |
| Protocols             | All (o TCP, UDP e ICMP)           |
| Targets               | All instances in the network      |
| Direction             | Ingress                           |

---

### 🧪 2.3. (Opcional) Permitir SSH temporalmente

1. Nombre: `fw-allow-ssh`
2. Puertos: TCP:22
3. Fuente: `YOUR_IP/32` (tu IP pública)
4. Solo si necesitas entrar a las VMs manualmente.

---

## ✅ Resultado esperado

Al finalizar este paso tendrás:

- Una red **`vpc-evaluador`** con una subnet en `us-central1`.
- Reglas que permiten tráfico HTTP desde internet hacia tus futuras VMs.
- Comunicación interna segura entre servicios por IP privada.

---

## 🧭 Próximo paso

➡️ Ir a: **[2_Backend_y_LoadBalancer.md]**  
Desplegaremos dos VMs con backend en puertos 3000 y 3001 y las conectaremos a un balanceador HTTP.

