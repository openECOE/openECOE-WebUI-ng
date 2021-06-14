import {PotionResources} from '@openecoe/potion-client';
import {
  Organization, User, Planner, Round, Shift,
  Area, ECOE, Question, Option, Station, Student, QBlock,
  Schedule, Stage, Event, Role
} from './models';

export const resources: PotionResources = {
  '/organizations': Organization,
  '/ecoes': ECOE,
  '/areas': Area,
  '/stations': Station,
  '/qblocks': QBlock,
  '/questions': Question,
  '/options': Option,
  '/students': Student,
  '/schedules': Schedule,
  '/stages': Stage,
  '/events': Event,
  '/planners': Planner,
  '/rounds': Round,
  '/shifts': Shift,
  '/users': User,
  '/roles': Role
};
