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
    Beds,
    Rating
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
    },
    {
      $Type : 'UI.DataField',
      Value : Rating
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
    },
    {
      $Type : 'UI.DataField',
      Value : Rating
    }
  ]}
});

annotate HostelService.Rooms with {
  RoomNumber  @(Common : {Label : '{i18n>Room.RoomNumber}'});
  Capacity    @(Common.Label : '{i18n>Room.Capacity}');
  Rating      @(Common.Label : '{i18n>Room.Rating}');
  Tables      @(Common.Label : '{i18n>Room.Tables}');
  Beds        @(Common.Label : '{i18n>Room.Beds}');
  Students    @(Common.Label : '{i18n>Room.Students}');
  EmptyPlaces @(Common.Label : '{i18n>Room.EmptyPlaces}');
  Notes       @(Common.Label : '{i18n>Room.Notes}');
};
annotate HostelService.Students with {
  FirstName   @(Common : {Label : '{i18n>Student.FirstName}'});
  LastName   @(Common : {Label : '{i18n>Student.LastName}'});
  Patronymic   @(Common : {Label : '{i18n>Student.Patronymic}'});
};

// annotate CatalogService.Suppliers with {
//   identifier @( Common : { Label: '{i18n>Cat.SuppliersIdentifier}', Text: name,  TextArrangement: #TextFirst } );
//   postCode @( Common : { Label: '{i18n>Cat.SuppliersPostCode}', Text: city, TextArrangement: #TextFirst } );
//   phone @Common.Label: '{i18n>Cat.SuppliersPhone}';
// };
