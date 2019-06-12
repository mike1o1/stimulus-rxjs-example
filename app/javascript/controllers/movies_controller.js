import { Controller } from 'stimulus';
import { Subject } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

export default class extends Controller {
  static targets = ['movieItem', 'movieDetails', 'movieDetailsLoading'];

  movieItem$ = new Subject();

  connect() {
    this.setupMovieClick();
  }

  disconnect() {
    // We need to make sure that we unsubscribe to the stream,
    // otherwise we could have memory leaks
    this.movieItem$.unsubscribe();
  }

  loadMovie(event) {
    let target = event.currentTarget;
    let movieSlug = target.getAttribute('data-movie-url');
  
    this.movieItemTargets.forEach((movieItem) => {
      movieItem.classList.remove('selected');
    });
  
    target.classList.add('selected');
  
    this.movieItem$.next(movieSlug);
  }

  setupMovieClick() {
    let loadingIndicatorTimeout;

    this.movieItem$
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          loadingIndicatorTimeout = setTimeout(() => {
            this.displayLoadingState();
          }, 250);
        }),
        switchMap((movieUrl) => {
          return ajax({
            method: 'GET',
            url: movieUrl,
            responseType: 'text'
          });
        }),
        tap(() => {
          clearTimeout(loadingIndicatorTimeout);
        }),
        map((response) => {
          return response.response;
        })
      )
      .subscribe((response) => {
        this.displayMovieContent(response);
      });
  }

  displayLoadingState() {
    this.movieDetailsLoadingTarget.classList.remove('hidden');
    this.movieDetailsTarget.classList.add('hidden');
  }

  displayMovieContent(movieContent) {
    this.movieDetailsTarget.innerHTML = movieContent;

    this.movieDetailsLoadingTarget.classList.add('hidden');
    this.movieDetailsTarget.classList.remove('hidden');
  }
}