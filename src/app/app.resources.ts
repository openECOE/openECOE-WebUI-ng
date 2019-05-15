import {PotionResources} from '@openecoe/potion-client';
import {
  Organization, User, Planner, Round, Shift,
  Area, ECOE, Question, Option, Station, Student, QBlock,
  Schedule, Stage, Event
} from './models';

export const resources: PotionResources = {
  '/organization': Organization,
  '/ecoe': ECOE,
  '/area': Area,
  '/station': Station,
  '/qblock': QBlock,
  '/question': Question,
  '/option': Option,
  '/student': Student,
  '/schedule': Schedule,
  '/stage': Stage,
  '/event': Event,
  '/planner': Planner,
  '/round': Round,
  '/shift': Shift,
  '/user': User
};
