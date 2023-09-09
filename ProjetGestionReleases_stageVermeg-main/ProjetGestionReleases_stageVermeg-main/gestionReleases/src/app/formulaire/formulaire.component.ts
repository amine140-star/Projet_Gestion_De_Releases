import { Component, OnInit, Renderer2 } from '@angular/core';
import { Projet } from '../models/Projet';
import { ProjetService } from '../services/projet.service';
import { Environnement } from '../models/Environnement';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.css']
})
export class FormulaireComponent implements OnInit {
  formnumber = 0; 
  environmentForms: number[] = [0]; // Tableau pour suivre les formulaires d'environnement
  environmentsList: Environnement[] = [{} as Environnement];
  submittingForm: boolean = false;
  currentStepParagraph: string = '';

 //form 
  nomProjet: string = '';
  numeroVersionProjet: string = '';
  versionJava: string = '';
  versionAngular: string = '';
  serveurWeb: string = '';
  baseDeDonnees: string = '';

  // Propriétés pour le formulaire d'environnement
  environnement: string = '';
  os: string = '';
  protocole: string = '';
  cpu!: number ;
  disque!: number ;
  memoire!: number;
  // end form  
 
  constructor(private renderer: Renderer2,private projetService: ProjetService,private router: Router) { }

  ngOnInit(): void {
    this.updateCurrentStepParagraph();

    // form
   const nextClick = document.querySelectorAll(".next_button");
   const mainForm = document.querySelectorAll(".main");
   const stepList = document.querySelectorAll(".progress-bar li");
   const num = document.querySelector(".step-number") as HTMLElement;
   
   nextClick.forEach(nextClickForm => {
    nextClickForm.addEventListener('click', () => {
      if (!this.validateForm()) {
          return; 
      }
      if (this.formnumber < mainForm.length - 1) { // Vérifie si ce n'est pas la dernière étape
        this.formnumber++;
        this.updateForm(mainForm);
        this.progressForward(stepList, num);
        this.contentChange();
      } else {
        // Traitez ici le code à exécuter lorsque vous cliquez sur "Terminer"
        this.submitForm();
      }
    });
  });

   const backClick = document.querySelectorAll(".back_button");
   backClick.forEach(backClickForm => {
     backClickForm.addEventListener('click', () => {
       this.formnumber--;
       this.updateForm(mainForm);
       this.progressBackward(stepList, num);
       this.contentChange();
     });
   });

   const username = document.querySelector("#user_name") as HTMLInputElement;
   const shownname = document.querySelector(".shown_name") as HTMLElement;

   const submitClick = document.querySelectorAll(".submit_button");
   submitClick.forEach(submitClickForm => {
     submitClickForm.addEventListener('click', () => {
       shownname.innerHTML = username.value;
       this.formnumber++;
       this.updateForm(mainForm);
     });
   });

  
   //form
  
 }
 //form
 updateForm(mainForm: NodeListOf<Element>) {
   mainForm.forEach(mainformNumber => {
     mainformNumber.classList.remove('active');
   });
   mainForm[this.formnumber].classList.add('active');
 }

 progressForward(stepList: NodeListOf<Element>, num: HTMLElement) {
   num.innerHTML = (this.formnumber + 1).toString();
   stepList[this.formnumber].classList.add('active');
 }

 progressBackward(stepList: NodeListOf<Element>, num: HTMLElement) {
   const formNum = this.formnumber + 1;
   stepList[formNum].classList.remove('active');
   num.innerHTML = formNum.toString();
 }

 contentChange() {
   const stepNumContent = document.querySelectorAll(".step-number-content");
   stepNumContent.forEach(content => {
     content.classList.remove('active');
     content.classList.add('d-none');
   });
   stepNumContent[this.formnumber].classList.add('active');
 }

 validateForm(): boolean {
  let validate = true;
  const validateInputs = document.querySelectorAll(".main.active input, .main.active select");
  validateInputs.forEach(validateInput => {
    validateInput.classList.remove('warning');
    if (validateInput.hasAttribute('required')) {
      if (
        (validateInput instanceof HTMLInputElement && validateInput.value.length === 0) ||
        (validateInput instanceof HTMLSelectElement && validateInput.value === '')
      ) {
        validate = false;
        validateInput.classList.add('warning');
      }
    }
  });
  return validate;
}

 //end form

 generateRandomVersion() {
  const randomNumber = Math.floor(Math.random() * 10000);
  const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  this.numeroVersionProjet = randomChar + randomNumber + randomChar;
}

addEnvironmentForm() {
  const newEnvironment: Environnement = {
    environnement: '',
    os: '',
    protocole: '',
    cpu: 0,
    disque: 0,
    memoire: 0
  };

  this.environmentForms.push(this.environmentForms.length);
  this.environmentsList.push(newEnvironment); // Ajoutez le nouvel environnement au tableau
}


removeLastEnvironmentForm() {
  if (this.environmentForms.length > 0) {
    this.environmentForms.pop();
  }
}



async submitForm() {
  if (this.formnumber === 1 && !this.submittingForm) {
    this.submittingForm = true;
    const projetEnvironnementsWrapper = {
      projet: {
        nomProjet: this.nomProjet,
        numeroVersionProjet: this.numeroVersionProjet,
        versionJava: this.versionJava,
        versionAngular: this.versionAngular,
        serveurWeb: this.serveurWeb,
        baseDeDonnees: this.baseDeDonnees
      },
      environnements: this.environmentForms.map(envFormIndex => {
        return {
          environnement: this.environmentsList[envFormIndex].environnement,
          os: this.environmentsList[envFormIndex].os,
          protocole: this.environmentsList[envFormIndex].protocole,
          cpu: this.environmentsList[envFormIndex].cpu,
          disque: this.environmentsList[envFormIndex].disque,
          memoire: this.environmentsList[envFormIndex].memoire
        };
      })
    };

    try {
      const projetResponse = await this.projetService.createProjetWithEnvironnements(
        projetEnvironnementsWrapper.projet,
        projetEnvironnementsWrapper.environnements
      ).toPromise();

      console.log('Projet et environnements ajoutés avec succès', projetResponse);

      // Appeler le service pour exécuter le script shell de création de projets
      const createProjectsResponse = await this.projetService.createProjects(projetEnvironnementsWrapper.projet).toPromise();

      console.log(createProjectsResponse);

      // Afficher une alerte de succès avec SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Succès !',
        text: 'Le projet et les environnements ont été ajoutés avec succès.',
        showConfirmButton: false,
        timer: 2000
      });

      // Réinitialiser la page vers l'étape 1 des projets
      this.router.navigate(['/formulaire']); // Assurez-vous d'avoir configuré la route correctement
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du projet et des environnements', error);
      // Afficher une alerte d'erreur avec SweetAlert2
      await Swal.fire({
        icon: 'error',
        title: 'Erreur !',
        text: 'Une erreur s\'est produite lors de l\'ajout du projet et des environnements.',
        showConfirmButton: true
      });

    } finally {
      this.submittingForm = false;
    }
  }
}

updateEnvironmentsFromStep1() {
  const selectedEnvironment = {
    environnement: this.environnement,
    os: this.os,
    protocole: this.protocole,
    cpu: this.cpu,
    disque: this.disque,
    memoire: this.memoire
  };

  this.environmentForms.forEach(envFormIndex => {
    this.environmentsList[envFormIndex] = { ...selectedEnvironment };
  });
}

nextStep() {
  if (this.validateForm()) {
    this.updateEnvironmentsFromStep1(); // Mettre à jour les propriétés Environnement
    this.formnumber++;
    this.updateCurrentStepParagraph();
  }
}


prevStep() {
  if (this.formnumber > 0) {
    this.formnumber--;
    this.updateCurrentStepParagraph();
  }
}
updateCurrentStepParagraph() {
  if (this.formnumber === 0) {
    this.currentStepParagraph = "Spécifier les informations requises pour l'élaboration du projet, y compris les détails sur les environnements nécessaires.";
  } else if (this.formnumber === 1) {
    this.currentStepParagraph = "Spécifier les informations requises pour l'élaboration du projet, y compris les détails sur les environnements nécessaires.";
  } else {
    this.currentStepParagraph = ''; // Réinitialisez le paragraphe si nécessaire
  }
}
}
