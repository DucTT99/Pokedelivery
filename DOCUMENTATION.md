# Dokumentation - PokeDelivery

Die Dokumentation dient als zentrale Wissensbasis für Entwickler:innen, Administrator:innen und
Entscheider:innen. Sie umfasst die Architektur, wichtige Design- und Tool-Entscheidungen sowie Anleitungen für die tägliche Arbeit mit der Plattform.

## 1. Architektur

Die Architektur-Dokumentation beschreibt den Aufbau und die wichtigsten Komponenten der Plattform.
PokéDelivery basiert auf einer REST-API, die als Azure Function implementiert ist.
Jenkins übernimmt die Aufgaben von Continuous Integration (Build & Test) und Continuous Deployment (Deployment nach Azure).
Die Infrastruktur wird nach Möglichkeit mit Terraform (Provisionierung) und Ansible (Konfiguration) beschrieben.
Containerisierung wird für Jenkins sowie die Build- und Test-Umgebungen genutzt.

- **API**: Azure Functions, stellt REST-API-Endpunkt bereit ('GET/pokemon/{name}') 
- **CI/CD**: Jenkins, Container-basiert mit 2 Agents auf VM und Raspberry Pi
- **Deployment**: Nach Azure, optional mit IaC (Terraform + Ansible)
- **Monitoring** Jenkins-Metriken und Azure Application Insights

## 2. Architekturentscheidung

- **Jenkins**: ARM64-kompatibel
- **Azure Functions**: Serverless, für Rahmen des Projekts ideal, da **kostenfrei** (Free Tier)
- **ARM64**: Raspberry Pi kostengünstige Testumgebung (gestellt)
- **GitHub**: zentrale Codeverwaltung, gute Integration mit Jenkins
- **Terraform**: Infrastracture as Code, Provisionierung, Umgebung kann wiederholbar, versionierbar und automatisiert erstellt werden
- **Ansible**: Configuration Management und Automation, wird genutzt bereitgestellte Server zu konfigurieren (z.B. Installation Docker, Setup Jenkins-Agents)
-**Terraform + Ansible**: Terraform stellt ressourcen, Ansible übernimmt Software-Installation und Konfiguration

## 3. Entwicklerdoku

#### REST API

Die Schnittstelle stellt Pokémon-Daten bereit. Standardmäßig werden diese ausschließlich aus der öffentlichen **PokeAPI** geladen.

Im Rahmen einer Erweiterung wurde eine interne Datenquelle ergänzt, die ein fest eingebautes benutzerdefiniertes Pokémon enthält (`buildInPokemon=Marcus`). Zusätzlich wurde die Möglichkeit geschaffen, temporäre Pokémon-Objekte zur Laufzeit über einen `POST`-Request zu registrieren. Diese werden im Arbeitsspeicher (`costumePokemon`) gehalten und sind nicht persistent.

Die URL-Struktur wurde von einer Query-basierten zu einer REST-konformen Pfadparameter-Struktur umgestellt:

- Vorher: `GET /api/getPokemon?name=Pokemonname`
- Jetzt: `GET /api/pokemon/{name}`


#### API-Tests

1. Ein einfacher Funktionstest ruft die REST-API direkt auf und simuliert einen `GET`-Request mit dem Namen eines Pokémon.  
Die Ausgabe enthält die vollständige Antwortstruktur (`context.res`) mit den geladenen Daten aus der PokeAPI.

2. Ein Funktionstest simuliert einen `POST`-Request zur Erstellung eines benutzerdefinierten Pokémon.  
Die Antwort enthält das neu erzeugte Objekt mit allen übergebenen Eigenschaften.



### IaC

#### Terraform

Mit Terraform wird die Infrastruktur als Code definiert und automatisiert bereitgestellt. Die Konfiguration umfasst folgende Ressourcen:

- **2 virtuelle Maschinen (VMs)**: Bereitstellung von Jenkins-Host und Jenkins-Agent
- **1 VPN Gateway**: Aufbau einer sicheren Verbindung zwischen Azure und dem Raspberry Pi
- **1 öffentliche IP-Adresse**: Zugriff auf die Jenkins-VM von außen
- **1 Function App**: Bereitstellung der REST-API zur Pokémon-Datenverarbeitung
- **1 Application Insights**: Monitoring und Logging für die Function App
- **1 virtuelles Netzwerk (VNet)**: Netzwerkstruktur zur Verbindung aller Ressourcen

1. Terraform installieren auf Azure VM mit Managed Identity

'''Bash 

**Microsoft GPG-Schlüssel importieren**
curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/
 
# Microsoft-Repository hinzufügen
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/azure-cli.list
 
# Paketliste aktualisieren
sudo apt update
 
# Azure CLI installieren
sudo apt install azure-cli
 
az login
 
az vm identity assign \
  --name <VM_NAME> \
  --resource-group <RESOURCE_GROUP>

2. Erstellung der main.tf-Datei für alle geplanten Ressourcen

'''Bash
- terraform init
- terraform plan
- terraform apply

**Ansible**

- Datei erstellen inventory.ini -> IP Adresse VMs und Hardware und Public Security Key


### CI/CD

### **Codeverwaltung mit GitHub**

- Repository in GitHub erstellt
- **Branching-Strategie:**
  - `main`: Produktionscode
  - `developer branches`: zum Testen von Schnittstellen

#### Neue Branch erstellen

git checkout main             # Wechsle auf den Hauptbranch (main)
git pull origin main          # Hole die neuesten Änderungen vom Remote-Repository
git checkout -b "newBranch"   # Erstelle einen neuen Branch und wechsle direkt hinein

#### Änderungen committen und pushen

'''bash
git add .                     # Alle geänderten Dateien zur Staging-Area hinzufügen
git commit -m "message"       # Commit mit einer aussagekräftigen Nachricht erstellen
git push

#### Workflow:
1. **Pull Request** eröffnen damit Änderung sichtbar und überprüfbar
2. **API-Test** automatisierte Tests laufen, um sicherzustellen das Änderungen keinen Fehler verursachen
2. **Mindestens 1 Reviewer erforderlich** ein Teammitglied muss den Pull Request prüfen und freigeben
3. Wenn alles passt dann **Merge**, Änderungen in Haupt-Branch (main) übernommen
4. **Deploy** gemergte Änderung in Produktion

### **Security and Compliance**

#### Jenkins: RBAC (Role-Based Access Control)

1. **Benutzer erstellen**  
   `Manage Jenkins → Users → + Create User`  
   Felder ausfüllen:
   - Username
   - Password
   - Confirm password
   - Full name
   - E-mail address

2. **Plugin installieren**  
   `Manage Jenkins → Plugin Manager → Available Plugins`  
   - Plugin: **Role-based Authorization Strategy**  
   - Jenkins neu starten (ggf. per SSH)

3. **Sicherheitskonfiguration aktivieren**  
   `Manage Jenkins → Security`  
   - Authorization: `Role-based strategy` auswählen  
   - Speichern

4. **Rollen verwalten und zuweisen**  
   `Manage Jenkins → Manage and Assign Roles`  
   - Rollen erstellen und Berechtigungen zuweisen

---

#### Tokens und Passwörter verwalten

1. **Credentials hinzufügen**  
   `Manage Jenkins → Credentials → (Domain: global) → Add Credentials`  
   Beispiel: Zugangsdaten für Azure oder GitHub

2. **Felder ausfüllen:**
   - Username: GitHub Username
   - Password: GitHub Token

3. **GitHub Token generieren:**
   - GitHub → Settings  
   - Developer Settings → Personal Access Token  
   - Tokens (classic) → Generate new token (classic)  
   - Scope auswählen: `repo` anhaken



### Jenkins Agents/Host

#### Azure Setup: Zwei ARM64 Ubuntu VMs mit Portfreigaben erstellen

---

#### 1. Azure Portal öffnen

[https://portal.azure.com/#home](https://portal.azure.comtellen

- Navigation:  
  `Create a resource` → `Create Virtual Machine`

- Konfiguration:
  - **Subscription**: Entsprechendes Abonnement auswählen
  - **Resource Group**: Bestehende Ressourcengruppe verwenden oder neu erstellen
  - **VM-Name**: z. B. `jenkins-host`, `jenkins-Agent`, 
  - **Region**: z. B. `West Europe`
  - **Availability options**: `Availability Zone`
  - **Security type**: `Standard`
  - **Image**: `Ubuntu Server 22.04 LTS - x64 Gen2` *(Free Tier geeignet)*
  - **VM architecture**: `ARM64`

- Weitere Einstellungen:  
  Durch die restlichen Tabs (Size, Authentication, Disks, Networking, Management etc.) navigieren und die VM erstellen.

---

#### 3. Zweite VM erstellen

- Schritt 2 wiederholen mit denselben Einstellungen
- **VM-Name**: z. B. `jenkins-agent`
- **Hinweis**: Dieselbe Ressourcengruppe wie bei der ersten VM verwenden

---

#### 4. Netzwerkeinstellungen konfigurieren

##### Für `jenkins-host` VM:

- Im Bereich **Networking** der VM eine neue **Inbound port rule** hinzufügen
- Konfiguration:
  - **Destination port ranges**: `8080`
  - **Destination port ranges**: `50000`
    - **Destination port ranges**: `9090`
  - **Destination port ranges**: `3000`
  - Weitere Einstellungen unverändert lassen
- Regel speichern


---

#### 5. Hintergrund zu den Ports

- **Port 8080**: Öffentlicher Zugriff auf die Jenkins-Oberfläche  
- **Port 50000**: Kommunikation zwischen Jenkins-Agent und Jenkins-Host  
- **Port 9090**: Zugriff auf Prometheus für Metrik-Erfassung  
- **Port 3000**: Zugriff auf Grafana für Visualisierung und Dashboards

---

#### Raspberry Pi Setup als Jenkins-Agent über Azure VPN

1. **VPN Gateway auf Azure einrichten**  
   - Erstellen eines VPN Gateways und Konfiguration eines lokalen Netzwerk-Gateways zur Verbindung mit dem Raspberry Pi-Netzwerk.

   Go-to Azure Portal:
   1. Create Virtual Network Gateway
   2. Tab through give it a name choose ressource Group
   3. Click on Virtual network and Subnet 

2. **Zertifikate konfigurieren**  
   - Generierung und Einbindung von Zertifikaten zur Authentifizierung der VPN-Verbindung.

3. **OpenVPN auf dem Raspberry Pi installieren**  
   - Installation des OpenVPN-Clients über Paketmanager.

4. **OpenVPN-Verbindung einrichten**  
   - Konfiguration der Verbindung mit Azure unter Verwendung der bereitgestellten Zugangsdaten und Zertifikate.

5. **Docker installieren**  
   - Installation von Docker zur Ausführung containerisierter Anwendungen.

6. **Jenkins Inbound Agent als Docker-Container starten**  
   - Ausführung des offiziellen Jenkins-Agent-Containers mit den erforderlichen Umgebungsvariablen (`JENKINS_URL`, `JENKINS_AGENT_NAME`, `JENKINS_SECRET`).

7. **Node in Jenkins konfigurieren**  
   - Erstellung eines neuen Nodes im Jenkins-Interface:
     - Agent-Name festlegen
     - Secret generieren

---

#### Jenkins Setup

1. **SSH-Verbindung zur VM herstellen**  
   Zugriff auf die virtuelle Maschine, auf der Jenkins betrieben werden soll.

   '''bash
   ssh [IP-Adresse]

2. **Docker installieren**  
   Installation von Docker zur Ausführung containerisierter Jenkins-Komponenten.

3. **Jenkins-Container starten (Host)**  
   Ausführung des offiziellen Jenkins-Server-Containers (HOST):

   ```bash
   docker run -d \
     --name jenkins \
     -p 8080:8080 -p 50000:50000 \
     -v jenkins_home:/var/jenkins_home \
     jenkins/jenkins:lts


für Agent: docker run --init jenkins/inbound-agent -url http://jenkins-server:port <secret> <agent name>

4. **Node in Jenkins konfigurieren**  
   - Erstellung eines neuen Nodes im Jenkins-Interface:
     - Agent-Name festlegen
     - Secret generieren



#### Deployment

**Function App:**

**Funktionsweise**

- **Build**: Klont das Repository von GitHub  
- **Login**: Authentifiziert sich über eine Managed Identity mit der Azure CLI  
- **Package**: Installiert Node.js-Abhängigkeiten, erstellt ein ZIP-Paket der Function App  
- **Deploy**: Überträgt das ZIP-Paket per `az functionapp deployment source config-zip` und startet die App neu

**Voraussetzungen**:

- Jenkins-Agent mit Docker, Node.js und Azure CLI  
- Managed Identity mit Berechtigungen für die Ressourcengruppe  
- Zugriff auf das GitHub-Repository


**Monitoring**

#### Monitoring


Zur Integration von Monitoring in Jenkins wird das Prometheus-Plugin verwendet:

1. Im Jenkins-Interface unter **Manage Jenkins → Plugins** das Plugin **Prometheus** installieren.
2. Nach der Installation unter **Manage Jenkins → System** den Prometheus-Endpunkt konfigurieren (Pfad angeben).
3. Änderungen speichern und Jenkins neu starten.

in vs docker compose prometheus und grafana einbinden








