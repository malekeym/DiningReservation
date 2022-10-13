export interface User {
  refreshToken: string;
  username: string;
  telegramId: number;
  _id: string;
}

export type ReservedData = {
  id: number;
  programId: number;
  programDate: string;
  groupId: number;
  consumed: boolean;
  selfId: number;
  selfCodeName: string;
  mealTypeId: number;
  foodTypeId: number;
  foodTypeTitle: string;
  foodNames: string;
  besideFoodNames: string;
  selectedCount: number;
  remainedCount: number;
  selected: boolean;
  forSale: boolean;
  sold: boolean;
  freeFoodSelected: boolean;
  deleteAsSellFreeFood: boolean;
  decreasedSelectedCountAsSellFreeFood: boolean;
  price: number;
  fullName: string;
  programDateTime: number;
  timeDistanceUntilToday: number;
  programDateStr: string;
  priorReserveDateStr: string;
  key: string;
};

type Reserve = {
  day: string;
  dayTranslated: string;
  date: string;
  dateJStr: string;
  mealTypes: [
    {
      mealTypeId: number;
      name: string;
      date: string;
      reserve: ReservedData;
      dateTime: number;
    },
  ];
};

type Meals = { id: number; name: string; disPriority: number };
export interface Reservations {
  type: string;
  code: number;
  message: string;
  messageFa: string;
  messageResource: string;
  payload: {
    weekDays: Array<Reserve>;
    mealTypes: Array<Meals>;
    remainCredit: number;
  };
}

type ProgramMeals = {
  mealTypeId: number;
  savedCount: number;
  monthCount: number;
};

type ReserveLawPriorityMap = {
  days: number;
  cancelDays: number;
  groupId: number;
  mealTypeId: number;
  floatMode: true;
  floatReservationMinute: number;
  floatReservationHour: number;
  floatCancelReservationMinute: number;
  floatCancelReservationHour: number;
};

type LimitReserve = {
  mealTypeId: number;
  fromTime: string;
  fromDaysBefore: number;
  toTime: string;
  toDaysBefore: 0;
};

export type SelfProgram = {
  programId: number;
  groupId: number;
  date: string;
  selfId: number;
  mealTypeId: number;
  mealTypeName: string;
  dayTranslated: string;
  validTotalCount: number;
  programFoodTypes: [
    {
      programId: number;
      foodTypeId: number;
      foodTypeTitle: string;
      foodList: [string];
      foodDefs: [
        {
          id: number;
          name: string;
          averageScore: number;
          voteCount: number;
        },
      ];
      price: number;
      validMinCount: number;
      validMaxCount: number;
      hideInPanel: boolean;
      fullName: string;
      foodNames: string;
      besideFoodNames: string;
      standardFoodNames: string;
      hasCountSetting: boolean;
    },
  ];
  daysDifferenceWithToday: number;
  cancelRuleViolated: boolean;
  reserveRuleViolated: boolean;
  dateTime: number;
};

export type Programs = {
  type: string;
  code: number;
  message: string;
  messageFa: string;
  messageResource: string;
  payload: {
    monthValidMealTotalCounts: [Array<ProgramMeals>];
    reserveLawPriorityDayMap: Record<string, ReserveLawPriorityMap>;
    selfWeekPrograms: Array<[SelfProgram]>;
    mealTypeReserveLimitMap: Record<string, ReserveLawPriorityMap>;
    reserveFreeFoodLimitMealTypeIdMap: Record<string, LimitReserve>;
    userWeekReserves: Array<ReservedData>;

    mealTypes: Array<Meals>;
    disabledMealTypesInDates: Array<string>;
    monthSavedTotalCount: Array<number>;
    monthValidTotalCount: number;
    weekSavedTotalCount: number;
    remainCredit: number;
  };
};

export type ReservationResponse = {
  type: 'ERROR' | 'SUCCESS';
  code: number;
  message: string;
  messageFa: string;
  messageResource: string;
};
