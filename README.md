# Datenbank einrichten

Dieses Projekt verwendet eine lokale PostgreSQL-Datenbank.

Die Anwendung erwartet standardmäßig folgende Datenbankverbindung:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/vaadin_demo
spring.datasource.username=postgres
spring.datasource.password=postgres
```

Die Datenbank muss lokal angelegt werden, bevor die Anwendung gestartet wird.

---

## 1. PostgreSQL installieren

Installiere zuerst PostgreSQL von der offiziellen PostgreSQL-Downloadseite:

<https://www.postgresql.org/download/>

Für Windows kann der offizielle PostgreSQL-Windows-Installer verwendet werden:

<https://www.postgresql.org/download/windows/>

Während der Installation sollte ein Passwort für den Benutzer `postgres` vergeben werden.

Für dieses Demo-Projekt wird folgendes Passwort erwartet:

```text
postgres
```

Falls ein anderes Passwort verwendet wird, muss dieses später in der Datei `src/main/resources/application.properties` angepasst werden.

Nach der Installation kann die Datenbank entweder über **SQL Shell (psql)** oder über **pgAdmin** eingerichtet werden.

---

## 2. Mit PostgreSQL verbinden

Öffne **SQL Shell (psql)**.

Bei den Abfragen können die Standardwerte  mit Enter bestätigt werden:

```text
Server [localhost]:
Database [postgres]:
Port [5432]:
Username [postgres]:
Password for user postgres:
```

Als Passwort wird verwendet:

```text
postgres
```

Wenn die Verbindung funktioniert, erscheint ungefähr:

```text
postgres=#
```

---

## 3. Datenbank erstellen

Führe in `psql` folgenden Befehl aus:

```sql
CREATE DATABASE vaadin_demo;
```

Danach mit der neuen Datenbank verbinden:

```sql
\c vaadin_demo
```

---

## 4. Tabelle erstellen

Die Demo verwendet eine einfache Kundentabelle `customers`.

```sql
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    company VARCHAR(150)
);
```

Die Tabelle hat folgende Struktur:

| Spalte | Typ | Bedeutung |
|---|---|---|
| `id` | `BIGSERIAL` | automatisch generierte technische ID |
| `first_name` | `VARCHAR(100)` | Vorname des Kunden |
| `last_name` | `VARCHAR(100)` | Nachname des Kunden |
| `email` | `VARCHAR(150)` | E-Mail-Adresse |
| `company` | `VARCHAR(150)` | Firma / Organisation |

---

## 5. Demo-Daten einfügen

Für die Vaadin-Grid-Demo werden viele Datensätze eingefügt. Dadurch kann gezeigt werden, dass die Anwendung mit einer größeren Datenmenge arbeitet.

Danach können 50.000 Demo-Kunden erzeugt werden:

```sql
WITH demo_data AS (
    SELECT
        ARRAY[
            'Anna', 'Max', 'Sofia', 'Lukas', 'Mia', 'Noah',
            'Emma', 'Leon', 'Lina', 'Finn', 'Clara', 'Paul',
            'Lea', 'Jonas', 'Marie', 'Ben', 'Laura', 'Elias',
            'Nina', 'Felix', 'Sarah', 'Tim', 'Julia', 'Moritz'
        ] AS first_names,
        ARRAY[
            'Schneider', 'Mueller', 'Weber', 'Fischer', 'Hoffmann', 'Becker',
            'Wagner', 'Schulz', 'Koch', 'Richter', 'Bauer', 'Klein',
            'Wolf', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krueger',
            'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause'
        ] AS last_names,
        ARRAY[
            'Schneider Consulting',
            'Mueller Maschinenbau',
            'Weber Digital GmbH',
            'Fischer Logistik',
            'Hoffmann Design Studio',
            'Becker IT Services',
            'Nordwind Solutions',
            'RheinTech GmbH',
            'Campus Software AG',
            'Urban Systems',
            'DataCraft GmbH',
            'GreenWare Solutions',
            'BluePeak Consulting',
            'NextStep Analytics',
            'CloudWerk GmbH'
        ] AS companies
)
INSERT INTO customers (first_name, last_name, email, company)
SELECT
    first_names[((gs - 1) % array_length(first_names, 1)) + 1],
    last_names[((gs - 1) % array_length(last_names, 1)) + 1],
    'kunde' || lpad(gs::text, 6, '0') || '@example.com',
    companies[((gs - 1) % array_length(companies, 1)) + 1]
FROM generate_series(1, 50000) AS gs, demo_data;
```

Hinweis: Die Beispieldaten verwenden bewusst Schreibweisen wie `Mueller` und `Krueger`, damit es auf Windows-Systemen keine Probleme mit Umlauten und Zeichencodierung gibt.

---

## 6. Daten prüfen

Anzahl der eingefügten Kunden prüfen:

```sql
SELECT COUNT(*) FROM customers;
```

Erwartetes Ergebnis:

```text
50000
```

Einige Datensätze anzeigen:

```sql
SELECT * FROM customers LIMIT 20;
```

---

## 7. Anwendung konfigurieren

Prüfe die Datei:

```text
src/main/resources/application.properties
```

Dort sollte für die lokale Demo stehen:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/vaadin_demo
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
vaadin.launch-browser=true
```

Falls bei der PostgreSQL-Installation ein anderes Passwort vergeben wurde, muss diese Zeile angepasst werden:

```properties
spring.datasource.password=DEIN_PASSWORT
```

