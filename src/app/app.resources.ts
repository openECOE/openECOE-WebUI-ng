import {PotionResources} from '@openecoe/potion-client';
import {
  Organization, User, Planner, Round, Shift,
  Area, ECOE, Question, Answer, Station, Student, QBlock,
  Schedule, Stage, Event
} from './models';

export const resources: PotionResources = {
  '/organizations': Organization,
  '/ecoes': ECOE,
  '/areas': Area,
  '/stations': Station,
  '/blocks': QBlock,
  '/questions': Question,
  '/students': Student,
  '/answers': Answer,
  '/schedules': Schedule,
  '/stages': Stage,
  '/events': Event,
  '/planners': Planner,
  '/rounds': Round,
  '/shifts': Shift,
  '/users': User
};
