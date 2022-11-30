import {PotionResources} from '@openecoe/potion-client';
import {
  Organization, User, Planner, Round, Shift,
  Area, ECOE, Station, Student, Block,
  Schedule, Stage, Event, Question, Answer, Role
} from './models';

export const resources: PotionResources = {
  '/organizations': Organization,
  '/ecoes': ECOE,
  '/areas': Area,
  '/stations': Station,
  '/blocks': Block,
  '/questions': Question,
  '/students': Student,
  '/answers': Answer,
  '/schedules': Schedule,
  '/stages': Stage,
  '/events': Event,
  '/planners': Planner,
  '/rounds': Round,
  '/shifts': Shift,
  '/users': User,
  '/roles': Role
};
