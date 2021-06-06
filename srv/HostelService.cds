using {bstu.hmss as db} from '../db/schema';

@path : '/hostel'
@impl : './HostelService.js'
service HostelService {
        @assert.integrity: false
  entity Rooms     as projection on db.Rooms;
          @assert.integrity: false
  entity Students  as projection on db.Students;

  @readonly
  entity Faculties as projection on db.Faculties;
};

annotate HostelService.Rooms with @(UI : {
  HeaderInfo             : {
    TypeName       : '{i18n>Room.TypeName}',
    TypeNamePlural : '{i18n>Room.TypeNamePlural}',
    Title          : {
      $Type : 'UI.DataField',
      Value : RoomNumber
    }
  },
  SelectionFields        : [
    RoomNumber,
    Capacity,
    EmptyPlaces,
    Beds
  ],
  LineItem               : [
    {
      $Type : 'UI.DataField',
      Value : RoomNumber,
    },
    {
      $Type : 'UI.DataField',
      Value : Capacity
    },
    {
      $Type : 'UI.DataField',
      Value : EmptyPlaces
    },
    {
      $Type : 'UI.DataField',
      Value : Beds
    }
  ],
  HeaderFacets           : [{
    $Type  : 'UI.ReferenceFacet',
    Target : '@UI.FieldGroup#RoomDetail'
  }],
  Facets                 : [{
    $Type  : 'UI.CollectionFacet',
    Label  : '{i18n>Room.FacetRoomInformation}',
    Facets : [{
      $Type  : 'UI.ReferenceFacet',
      Target : '@UI.FieldGroup#RoomInfo',
      Label  : '{i18n>Room.FacetSectionRoomInformation}'
    }, ]
  }],
  FieldGroup #RoomInfo   : {Data : [
    {
      $Type : 'UI.DataField',
      Value : Capacity
    },
    {
      $Type : 'UI.DataField',
      Value : Beds
    },
    {
      $Type : 'UI.DataField',
      Value : Tables
    }
  ]},
  FieldGroup #RoomDetail : {Data : [
    {
      $Type : 'UI.DataField',
      Value : RoomNumber
    },
    {
      $Type : 'UI.DataField',
      Value : Capacity
    },
    {
      $Type : 'UI.DataField',
      Value : EmptyPlaces
    },
    {
      $Type : 'UI.DataField',
      Value : Beds
    },
    {
      $Type : 'UI.DataField',
      Value : Tables
    }
  ]}
});

annotate HostelService.Rooms with {
  RoomNumber  @(Common : {Label : '{i18n>Room.RoomNumber}'});
  Capacity    @(Common.Label : '{i18n>Room.Capacity}');
  Tables      @(Common.Label : '{i18n>Room.Tables}');
  Beds        @(Common.Label : '{i18n>Room.Beds}');
  Students    @(Common.Label : '{i18n>Room.Students}');
  EmptyPlaces @(Common.Label : '{i18n>Room.EmptyPlaces}');
  Notes       @(Common.Label : '{i18n>Room.Notes}');
  ActionIndicator       @(Common.Label : '{i18n>Room.ActionIndicator}');
};

annotate HostelService.Students with {
  FirstName   @(Common : {Label : '{i18n>Student.FirstName}'});
  LastName   @(Common : {Label : '{i18n>Student.LastName}'});
  Patronymic   @(Common : {Label : '{i18n>Student.Patronymic}'});
  Email   @(Common : {Label : '{i18n>Student.Email}'});
  City   @(Common : {Label : '{i18n>Student.City}'});
  CountryText   @(Common : {Label : '{i18n>Student.Country}'});
  Room   @(Common : {Label : '{i18n>Student.Room_RoomNumber}'});
  ActionIndicator       @(Common.Label : '{i18n>Student.ActionIndicator}');
  AddressLine       @(Common.Label : '{i18n>Student.AddressLine}');
  CheckIn       @(Common.Label : '{i18n>Student.CheckIn}');
  CheckOut       @(Common.Label : '{i18n>Student.CheckOut}');
  ZipCode       @(Common.Label : '{i18n>Student.ZipCode}');
};

annotate HostelService.Students with @(UI : {
  SelectionFields        : [
    FirstName,
    LastName,
    Room_RoomNumber,
    Email,
    Country,
    City,
    AddressLine1,
    CheckIn,
    CheckOut
  ]
  });