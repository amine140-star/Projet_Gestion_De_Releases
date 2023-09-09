#!/bin/bash

nomProjet=$1


# Demander le nom d'utilisateur GitHub
read -p "Nom d'utilisateur GitHub : " GITHUB_USERNAME

# Demander le jeton d'authentification GitHub
read -sp "Jetons d'authentification GitHub (créez-en un ici : https://github.com/settings/tokens) : " GITHUB_TOKEN

# Créer un dépôt Git distant sur GitHub en utilisant l'API GitHub
response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" -d '{"name":"'$nomProjet'"}' https://api.github.com/user/repos)

# Vérifier si la création du dépôt a réussi
if [[ $response == *"\"message\":\"Requires authentication\""* ]]; then
  echo "Échec de la création du dépôt sur GitHub. Assurez-vous que le jeton d'authentification GitHub est correct."
  exit 1
fi

# Cloner le dépôt Git localement
git clone "https://github.com/$GITHUB_USERNAME/$nomProjet.git"
cd $nomProjet

# Créer un projet Angular dans le dossier "nomProjet_front"
npx -p @angular/cli ng new nomProjet_front --skip-git --skip-install --routing=false --style=css


# Créer un projet Spring Boot dans le dossier "nomProjet_Back"
curl "https://start.spring.io/starter.zip?type=maven-project&javaVersion=11" -o spring-boot.zip
unzip spring-boot.zip -d nomProjet_Back

# Initialiser le dépôt Git local et ajouter les fichiers du projet Angular
cd nomProjet_front
git init
git add .
git commit -m "Initial commit for Angular project"

# Pousser le projet Angular vers le dépôt GitHub dans une branche "angular"
git remote add origin "https://github.com/$GITHUB_USERNAME/$nomProjet.git"
git checkout -b angular
git push -u origin angular
cd ..

# Ajouter les fichiers du projet Spring Boot au dépôt Git local
cd nomProjet_Back
git init
git add .
git commit -m "Initial commit for Spring Boot project"

# Pousser le projet Spring Boot vers le dépôt GitHub dans une branche "spring-boot"
git remote add origin "https://github.com/$GITHUB_USERNAME/$nomProjet.git"
git checkout -b spring-boot
git push -u origin spring-boot
cd ..

echo "Projets Angular et Spring Boot créés avec succès dans des branches distinctes sur GitHub."
read -p "Appuyez sur Entrée pour quitter..."