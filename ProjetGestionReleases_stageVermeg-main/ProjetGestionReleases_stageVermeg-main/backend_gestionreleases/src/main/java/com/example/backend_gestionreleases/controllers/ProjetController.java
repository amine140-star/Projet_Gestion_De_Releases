package com.example.backend_gestionreleases.controllers;

import com.example.backend_gestionreleases.entities.Environnement;
import com.example.backend_gestionreleases.entities.Projet;
import com.example.backend_gestionreleases.entities.ProjetEnvironnementsWrapper;
import com.example.backend_gestionreleases.repositories.EnvironnementRepository;
import com.example.backend_gestionreleases.repositories.ProjetRepository;
import com.example.backend_gestionreleases.services.IEnvironnementServiceImpl;
import com.example.backend_gestionreleases.services.IProjetServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
@RequestMapping("/projets")
public class ProjetController {

    @Autowired
    IProjetServiceImpl iProjetService;
    @Autowired
    ProjetRepository projetRepository;
    @Autowired
    IEnvironnementServiceImpl iEnvironnementService;

    @PostMapping("/addprojet")
    public ResponseEntity<Projet> createProjetWithEnvironnements(@RequestBody ProjetEnvironnementsWrapper wrapper) {
        Projet projet = wrapper.getProjet();
        List<Environnement> environnements = wrapper.getEnvironnements();

        Projet savedProjet = iProjetService.saveProjet(projet);

        for (Environnement environnement : environnements) {
            environnement.setProjet(savedProjet);
            iEnvironnementService.saveEnvironnement(environnement);
        }

        return ResponseEntity.ok(savedProjet);
    }

    @GetMapping("/allprojets")
    public ResponseEntity<List<Projet>> getAllProjets() {
        List<Projet> projets = projetRepository.findAll();
        return new ResponseEntity<>(projets, HttpStatus.OK);
    }


    @PostMapping("/createprojects")
    public ResponseEntity<String> createProjects(@RequestBody Projet projet) {
        try {
            // Récupérer les données du projet
            String nomProjet = projet.getNomProjet();
            String versionAngular = projet.getVersionAngular().toString(); // Convertir l'énumération en chaîne
            String versionJava = projet.getVersionJava().toString(); // Convertir l'énumération en chaîne

            // Appeler le script shell
           String command = "cmd.exe /c F:\\Stage4_eme\\backend_gestionreleases\\automatisation.sh " + nomProjet + " " + versionAngular + " " + versionJava;
            // String command = "cmd.exe /c F:\\Stage4_eme\\backend_gestionreleases\\automatisation.sh " + nomProjet + " " + versionJava;

            Process process = Runtime.getRuntime().exec(command);
            process.waitFor();

            // Traiter la sortie du script
            int exitValue = process.exitValue();
            if (exitValue == 0) {
                return ResponseEntity.ok("Projets créés avec succès !");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la création des projets.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'exécution du script.");
        }
    }
}