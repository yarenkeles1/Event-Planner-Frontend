import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { EventList } from './event-list/event-list';
import { EventDetail } from './event-detail/event-detail';
import { EventCreate } from './event-create/event-create';
import { EventEdit } from './event-edit/event-edit';
import { MyEvents } from './my-events/my-events';
import { JoinedEvents } from './joined-events/joined-events';
import { Profile } from './profile/profile';
import { authGuard } from './auth-guard';
import { notAuthGuard } from './not-auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'events', component: EventList },
  { path: 'event-detail/:id', component: EventDetail },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'event-create', component: EventCreate },
      { path: 'event-edit/:id', component: EventEdit },
      { path: 'my-events', component: MyEvents },
      { path: 'joined-events', component: JoinedEvents },
      { path: 'profile', component: Profile }
    ]
  },

  { path: '**', redirectTo: 'events' }
];