import {PotionResources} from '@infarm/potion-client';
import {Schedule, Stage, Event} from './models/schedule';
import {Area, ECOE, Question, Option, Station, Student, QBlock} from './models/ecoe';
import {Organization} from './models/organization';
import {Planner, Round, Shift} from './models/planner';

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
  '/shift': Shift
};
