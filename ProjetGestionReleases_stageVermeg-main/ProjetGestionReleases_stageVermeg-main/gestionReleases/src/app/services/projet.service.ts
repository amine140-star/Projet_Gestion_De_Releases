import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Projet } from '../models/Projet';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Environnement } from '../models/Environnement';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {

  private baseUrl = 'http://localhost:8081'; // Remplacez par votre URL backend

  constructor(private http: HttpClient) {}

  getProjets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projets/allprojets`);
  }

  createProjetWithEnvironnements(projet: Projet, environnements: Environnement[]): Observable<Projet> {
    const projetEnvironnementsWrapper = {
      projet,
      environnements
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Projet>(`${this.baseUrl}/projets/addprojet`, projetEnvironnementsWrapper, httpOptions);
  }
  
  getEnvironnementsByProjet(projetId: number): Observable<Environnement[]> {
    return this.http.get<Environnement[]>(`${this.baseUrl}/environnements/byprojet/${projetId}`);
  }
  
  createProjects(projet: Projet): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  
    return this.http.post<string>(`${this.baseUrl}/projets/createprojects`, projet, httpOptions)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // Une erreur côté client a eu lieu
            console.error('Une erreur côté client a eu lieu:', error.error.message);
          } else {
            // Le backend a retourné une erreur avec un code de statut
            console.error(
              `Code de statut du backend ${error.status}, ` +
              `body était: ${error.error}`);
          }
          // Renvoyer une erreur observable
          return throwError('Quelque chose s\'est mal passé lors de la tentative de création des projets.');
        })
      );
  }
  
  
}
