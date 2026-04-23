# uTasks Project

## Description

**uTask** est une application web de gestion de tâches développée dans le cadre du cours **Développement d'applications Web (GLO3102)** à l'**Université Laval** (Québec).

Le projet met en pratique les concepts enseignés durant le cours, notamment la conception et le développement d'une application full-stack moderne avec un frontend en React/TypeScript et un backend Node.js.

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