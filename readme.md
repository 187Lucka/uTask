# uTasks Project

## Prérequis
Assurez-vous d'avoir les outils suivants installés sur votre machine :
- [Docker](https://www.docker.com/)
- [pnpm](https://pnpm.io/)

## Lancer le projet

### Backend
1. Ouvrez un terminal et naviguez dans le dossier `back` :
    ```bash
    cd back
    ```
2. Lancez les conteneurs Docker :
    ```bash
    docker-compose up
    ```
3. Installez les dépendances avec pnpm :
    ```bash
    pnpm i
    ```
4. Démarrez le serveur de développement :
    ```bash
    pnpm dev
    ```

### Frontend
1. Ouvrez un autre terminal et naviguez dans le dossier `front` :
    ```bash
    cd front
    ```
2. Installez les dépendances avec pnpm :
    ```bash
    pnpm i
    ```
3. Démarrez le serveur de développement :
    ```bash
    pnpm dev
    ```

Votre projet est maintenant lancé. Vous pouvez accéder à l'application via votre navigateur.