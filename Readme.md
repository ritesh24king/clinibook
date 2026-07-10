# CliniBook SR

## Beschrijving

CliniBook SR is een web-applicatie voor het beheren van doktersafspraken in Suriname. De applicatie biedt drie soorten gebruikers — **patiënten**, **artsen** en **verzekeraars** — elk met hun eigen functionaliteiten:

- Patiënten kunnen afspraken inplannen, recepten inzien, chatten met hun arts en vragen stellen.
- Artsen kunnen afspraken goed- of afkeuren, recepten uitschrijven, medische rapporten opstellen en chatten met patiënten.
- Verzekeraars kunnen patiëntendossiers inzien en notities toevoegen.

Authenticatie verloopt via JWT (JSON Web Tokens), zodat elke API-route alleen toegankelijk is voor ingelogde gebruikers met de juiste rol.

## technologies

- **Node.js** — runtime omgeving
- **Express** — webserver / API-framework
- **JWT (jsonwebtoken)** — authenticatie en autorisatie
- **bcrypt** — wachtwoord-hashing
- **dotenv** — beheer van omgevingsvariabelen
- **MySQL2** — database driver, koppelt de server aan de MySQL-database
- **PDFKit** — genereren van PDF-recepten
- **Multer** — verwerken van file-uploads (receptfoto's, opgeslagen in `/uploads`)
- **cors / cookie-parser** — middleware voor cross-origin requests en cookies
- **Nodemon** — automatisch herstarten van de server tijdens development

## requirements for running the projects

Voordat je het project draait, zorg dat het volgende geïnstalleerd is:

- [Node.js](https://nodejs.org/) (v18 of hoger aanbevolen)
- [npm](https://www.npmjs.com/) (wordt meegeleverd met Node.js)
- Een lokale [MySQL](https://www.mysql.com/) server (bv. via XAMPP/MAMP of een losse installatie)

## installation instructions

1. **Clone of download het project** naar je lokale machine.

2. **Open een terminal** en navigeer naar de projectmap:
   ```bash
   cd pad/naar/clinibook-sr
   ```

3. **Installeer de dependencies**:
   ```bash
   npm install
   ```

4. **Maak een `.env` bestand aan** in de root van het project (zie [Database instellen](#database-instellen) hieronder voor de inhoud).

5. **Start de server**:
   ```bash
   node server.js
   ```
   Of, voor development met automatische herstart bij wijzigingen:
   ```bash
   npm run dev
   ```

6. De applicatie is nu bereikbaar via:
   ```
   http://localhost:3000
   ```

## Database instellen

Dit project gebruikt een **MySQL-database**. Je moet dus zelf eerst een lokale MySQL-server draaien en de database aanmaken voordat je de applicatie start.

1. Zorg dat je MySQL-server draait (bv. via XAMPP/MAMP) en maak een lege database aan:
   ```sql
   CREATE DATABASE clinibook;
   ```

2. Voer het schema uit (maakt alle tabellen aan):
   ```bash
   mysql -u root -p clinibook < sql/schema.sql
   ```

3. Voer de seed-data uit (vult de tabellen met demo-accounts en voorbeelddata):
   ```bash
   mysql -u root -p clinibook < sql/seed.sql
   ```

4. Maak een `.env` bestand aan in de root van het project op basis van `.env.example`:
   ```bash
   cp .env.example .env
   ```
   (Windows PowerShell: `copy .env.example .env`)

5. Vul de volgende variabelen in (pas `DB_USER`/`DB_PASSWORD` aan naar jouw eigen MySQL-inloggegevens):
   ```
   NODE_ENV=development
   JWT_SECRET=jouw-eigen-geheime-sleutel
   PORT=3000

   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=clinibook
   DB_PORT=3306
   ```

6. **Genereer een veilige `JWT_SECRET`** in plaats van de standaardwaarde te gebruiken:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Kopieer de output naar de `JWT_SECRET` variabele in je `.env` bestand.

## Gebruiksinstructies

1. **Inloggen**: ga naar `http://localhost:3000` en log in met een van de demo-accounts (zie `sql/seed.sql` voor de standaard testgebruikers — wachtwoord voor iedereen is `123456`), of stuur een POST-request naar:
   ```
   POST /api/auth/login
   Body: { "email": "...", "password": "..." }
   ```
   Dit geeft een JWT-token terug.

2. **Gebruik het token**: stuur dit token mee in de `Authorization` header bij elke volgende request:
   ```
   Authorization: Bearer <jouw-token>
   ```

3. **Afhankelijk van je rol** (patiënt, arts of verzekeraar) krijg je toegang tot verschillende functionaliteiten zoals afspraken inplannen, recepten beheren, dossiers inzien of chatten.

4. De API-routes zijn per onderwerp opgesplitst in de map `routes/` (bv. `routes/appointments.js`, `routes/prescriptions.js`). `server.js` koppelt deze routers alleen aan hun URL-pad; raadpleeg `server.js` voor het overzicht van welk routebestand bij welk pad hoort.

## Verboden: `node_modules` map

De map `node_modules` mag **nooit** worden toegevoegd aan versiebeheer (git). Deze map wordt automatisch gegenereerd door `npm install` op basis van `package.json` en `package-lock.json`, en kan duizenden bestanden bevatten. Zorg dat deze map in `.gitignore` staat.

## Verboden: `.env` bestand

Het `.env` bestand mag **nooit** worden gecommit naar versiebeheer (git). Dit bestand bevat gevoelige gegevens zoals de `JWT_SECRET` en eventuele databasewachtwoorden. Het lekken van dit bestand kan de veiligheid van de hele applicatie in gevaar brengen. Gebruik in plaats daarvan `.env.example` als sjabloon (zonder echte geheimen) en zorg dat `.env` in `.gitignore` staat.
