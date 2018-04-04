﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Core.Objects;
using System.Linq;

public partial class iOPS_NormalizedEntities : DbContext
{
    public iOPS_NormalizedEntities()
        : base("name=iOPS_NormalizedEntities")
    {
    }

    protected override void OnModelCreating(DbModelBuilder modelBuilder)
    {
        throw new UnintentionalCodeFirstException();
    }

    public virtual DbSet<iOPSUser> iOPSUsers { get; set; }
    public virtual DbSet<AuthorizableActivity> AuthorizableActivities { get; set; }
    public virtual DbSet<UserAuthorizedActivity> UserAuthorizedActivities { get; set; }
    public virtual DbSet<UserEventLog> UserEventLogs { get; set; }
    public virtual DbSet<UserEventType> UserEventTypes { get; set; }
    public virtual DbSet<Country> Countries { get; set; }
    public virtual DbSet<Person> People { get; set; }
    public virtual DbSet<Company> Companies { get; set; }
    public virtual DbSet<CompanyContact> CompanyContacts { get; set; }
    public virtual DbSet<CompanyDataReader> CompanyDataReaders { get; set; }
    public virtual DbSet<Site> Sites { get; set; }
    public virtual DbSet<SiteCompany> SiteCompanies { get; set; }
    public virtual DbSet<SiteDataReader> SiteDataReaders { get; set; }
    public virtual DbSet<AssetCondition> AssetConditions { get; set; }
    public virtual DbSet<AssetType> AssetTypes { get; set; }
    public virtual DbSet<CompanyType> CompanyTypes { get; set; }
    public virtual DbSet<SystemType> SystemTypes { get; set; }
    public virtual DbSet<Observation> Observations { get; set; }
    public virtual DbSet<Tag> Tags { get; set; }
    public virtual DbSet<SystemGroup> SystemGroups { get; set; }
    public virtual DbSet<CustomJBTStandardObservation> CustomJBTStandardObservations { get; set; }
    public virtual DbSet<JBTStandardObservation> JBTStandardObservations { get; set; }
    public virtual DbSet<Unit> Units { get; set; }
    public virtual DbSet<Widget> Widgets { get; set; }
    public virtual DbSet<WidgetType> WidgetTypes { get; set; }
    public virtual DbSet<StateAbbreviation> StateAbbreviations { get; set; }
    public virtual DbSet<BHSBagTagScan> BHSBagTagScans { get; set; }
    public virtual DbSet<DatabaseMailQueue> DatabaseMailQueues { get; set; }
    public virtual DbSet<BHSJamAlarm> BHSJamAlarms { get; set; }
    public virtual DbSet<BHSDeviceLocation> BHSDeviceLocations { get; set; }
    public virtual DbSet<BHSCurrentAlarm> BHSCurrentAlarms { get; set; }
    public virtual DbSet<Dashboard> Dashboards { get; set; }
    public virtual DbSet<DashboardTimeScope> DashboardTimeScopes { get; set; }
    public virtual DbSet<BHSCBRAEntryStatu> BHSCBRAEntryStatus { get; set; }
    public virtual DbSet<BHSDeviceLocationThroughput> BHSDeviceLocationThroughputs { get; set; }
    public virtual DbSet<BHSTokenTracker> BHSTokenTrackers { get; set; }
    public virtual DbSet<BHSToken> BHSTokens { get; set; }
    public virtual DbSet<BHSAlarmHistory> BHSAlarmHistories { get; set; }
    public virtual DbSet<BHSCarrier> BHSCarriers { get; set; }
    public virtual DbSet<BHSDeviceLocationCarrierMap> BHSDeviceLocationCarrierMaps { get; set; }
    public virtual DbSet<Asset> Assets { get; set; }
    public virtual DbSet<WidgetCustomTagDisplayOrder> WidgetCustomTagDisplayOrders { get; set; }
    public virtual DbSet<AssetGraphic> AssetGraphics { get; set; }
    public virtual DbSet<AssetGraphicVisibleValue> AssetGraphicVisibleValues { get; set; }
    public virtual DbSet<WidgetGraphTag> WidgetGraphTags { get; set; }
    public virtual DbSet<SystemGraphic> SystemGraphics { get; set; }
    public virtual DbSet<SystemGraphicVisibleValue> SystemGraphicVisibleValues { get; set; }
    public virtual DbSet<ObservationAggregatedHighChartValue> ObservationAggregatedHighChartValues { get; set; }
    public virtual DbSet<GSJBTStandardObservationIdExclusionListFromCurrentAlarm> GSJBTStandardObservationIdExclusionListFromCurrentAlarms { get; set; }
    public virtual DbSet<ChronologicalRawTagValueLogKepwareReceiver> ChronologicalRawTagValueLogKepwareReceivers { get; set; }
    public virtual DbSet<GSReport> GSReports { get; set; }
    public virtual DbSet<GSReportRun> GSReportRuns { get; set; }
    public virtual DbSet<GSAlarmHistory> GSAlarmHistories { get; set; }

    public virtual ObjectResult<BHSLocationThroughput_Result1> BHSLocationThroughput(Nullable<System.DateTime> beginDate, Nullable<System.DateTime> endDate, string location, Nullable<long> siteId)
    {
        var beginDateParameter = beginDate.HasValue ?
            new ObjectParameter("beginDate", beginDate) :
            new ObjectParameter("beginDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("endDate", endDate) :
            new ObjectParameter("endDate", typeof(System.DateTime));

        var locationParameter = location != null ?
            new ObjectParameter("location", location) :
            new ObjectParameter("location", typeof(string));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSLocationThroughput_Result1>("BHSLocationThroughput", beginDateParameter, endDateParameter, locationParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSActiveAlarmSummaryByDayWithAverageDurationInSeconds_Result1> BHSActiveAlarmSummaryByDayWithAverageDurationInSeconds(Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, Nullable<long> siteId)
    {
        var startDateParameter = startDate.HasValue ?
            new ObjectParameter("startDate", startDate) :
            new ObjectParameter("startDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("endDate", endDate) :
            new ObjectParameter("endDate", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSActiveAlarmSummaryByDayWithAverageDurationInSeconds_Result1>("BHSActiveAlarmSummaryByDayWithAverageDurationInSeconds", startDateParameter, endDateParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSActiveAlarmSummaryByHourWithAverageDurationInSeconds_Result1> BHSActiveAlarmSummaryByHourWithAverageDurationInSeconds(Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, Nullable<long> siteId)
    {
        var startDateParameter = startDate.HasValue ?
            new ObjectParameter("startDate", startDate) :
            new ObjectParameter("startDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("endDate", endDate) :
            new ObjectParameter("endDate", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSActiveAlarmSummaryByHourWithAverageDurationInSeconds_Result1>("BHSActiveAlarmSummaryByHourWithAverageDurationInSeconds", startDateParameter, endDateParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSLocationThroughputHistoryByDay_Result> BHSLocationThroughputHistoryByDay(Nullable<System.DateTime> beginDate, Nullable<System.DateTime> endDate, string location)
    {
        var beginDateParameter = beginDate.HasValue ?
            new ObjectParameter("beginDate", beginDate) :
            new ObjectParameter("beginDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("endDate", endDate) :
            new ObjectParameter("endDate", typeof(System.DateTime));

        var locationParameter = location != null ?
            new ObjectParameter("location", location) :
            new ObjectParameter("location", typeof(string));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSLocationThroughputHistoryByDay_Result>("BHSLocationThroughputHistoryByDay", beginDateParameter, endDateParameter, locationParameter);
    }

    public virtual ObjectResult<BHSAutomaticTokenReaderPercentReadRateReportGroupedByDateRange_Result1> BHSAutomaticTokenReaderPercentReadRateReportGroupedByDateRange(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSAutomaticTokenReaderPercentReadRateReportGroupedByDateRange_Result1>("BHSAutomaticTokenReaderPercentReadRateReportGroupedByDateRange", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSAutomaticTokenReaderPercentReadRateReportGroupedByHour_Result> BHSAutomaticTokenReaderPercentReadRateReportGroupedByHour(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSAutomaticTokenReaderPercentReadRateReportGroupedByHour_Result>("BHSAutomaticTokenReaderPercentReadRateReportGroupedByHour", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSAutomaticTokenReaderPercentReadRateReportGroupedByDay_Result1> BHSAutomaticTokenReaderPercentReadRateReportGroupedByDay(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSAutomaticTokenReaderPercentReadRateReportGroupedByDay_Result1>("BHSAutomaticTokenReaderPercentReadRateReportGroupedByDay", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSActiveAlarmSummaryByAlarmTypeAndDayWithAverageDurationInSeconds_Result2> BHSActiveAlarmSummaryByAlarmTypeAndDayWithAverageDurationInSeconds(Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, Nullable<long> siteId, string alarmType)
    {
        var startDateParameter = startDate.HasValue ?
            new ObjectParameter("startDate", startDate) :
            new ObjectParameter("startDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("endDate", endDate) :
            new ObjectParameter("endDate", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        var alarmTypeParameter = alarmType != null ?
            new ObjectParameter("alarmType", alarmType) :
            new ObjectParameter("alarmType", typeof(string));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSActiveAlarmSummaryByAlarmTypeAndDayWithAverageDurationInSeconds_Result2>("BHSActiveAlarmSummaryByAlarmTypeAndDayWithAverageDurationInSeconds", startDateParameter, endDateParameter, siteIdParameter, alarmTypeParameter);
    }

    public virtual ObjectResult<BHSActiveAlarmSummaryByAlarmTypeAndHourWithAverageDurationInSeconds_Result2> BHSActiveAlarmSummaryByAlarmTypeAndHourWithAverageDurationInSeconds(Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, Nullable<long> siteId, string alarmType)
    {
        var startDateParameter = startDate.HasValue ?
            new ObjectParameter("startDate", startDate) :
            new ObjectParameter("startDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("endDate", endDate) :
            new ObjectParameter("endDate", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        var alarmTypeParameter = alarmType != null ?
            new ObjectParameter("alarmType", alarmType) :
            new ObjectParameter("alarmType", typeof(string));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSActiveAlarmSummaryByAlarmTypeAndHourWithAverageDurationInSeconds_Result2>("BHSActiveAlarmSummaryByAlarmTypeAndHourWithAverageDurationInSeconds", startDateParameter, endDateParameter, siteIdParameter, alarmTypeParameter);
    }

    public virtual ObjectResult<BHSBagDimensionerPercentReadRateReportGroupedByDateRange_Result> BHSBagDimensionerPercentReadRateReportGroupedByDateRange(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSBagDimensionerPercentReadRateReportGroupedByDateRange_Result>("BHSBagDimensionerPercentReadRateReportGroupedByDateRange", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSLocationThroughputHistoryByHour_Result1> BHSLocationThroughputHistoryByHour(Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, string location)
    {
        var startDateParameter = startDate.HasValue ?
            new ObjectParameter("startDate", startDate) :
            new ObjectParameter("startDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("endDate", endDate) :
            new ObjectParameter("endDate", typeof(System.DateTime));

        var locationParameter = location != null ?
            new ObjectParameter("location", location) :
            new ObjectParameter("location", typeof(string));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSLocationThroughputHistoryByHour_Result1>("BHSLocationThroughputHistoryByHour", startDateParameter, endDateParameter, locationParameter);
    }

    public virtual ObjectResult<BHSTop5AlarmTypes_Result> BHSTop5AlarmTypes(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSTop5AlarmTypes_Result>("BHSTop5AlarmTypes", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSTotalSystemThroughput_Result1> BHSTotalSystemThroughput(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId, string oDataAccessToken)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("beginTime", beginTime) :
            new ObjectParameter("beginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("endTime", endTime) :
            new ObjectParameter("endTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        var oDataAccessTokenParameter = oDataAccessToken != null ?
            new ObjectParameter("ODataAccessToken", oDataAccessToken) :
            new ObjectParameter("ODataAccessToken", typeof(string));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSTotalSystemThroughput_Result1>("BHSTotalSystemThroughput", beginTimeParameter, endTimeParameter, siteIdParameter, oDataAccessTokenParameter);
    }

    public virtual ObjectResult<BHSTop5AlarmTypeLongestDuration_Result1> BHSTop5AlarmTypeLongestDuration(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSTop5AlarmTypeLongestDuration_Result1>("BHSTop5AlarmTypeLongestDuration", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSAlarmAreaCount_Result> BHSAlarmAreaCount(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId, string oDataAccessToken)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        var oDataAccessTokenParameter = oDataAccessToken != null ?
            new ObjectParameter("ODataAccessToken", oDataAccessToken) :
            new ObjectParameter("ODataAccessToken", typeof(string));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSAlarmAreaCount_Result>("BHSAlarmAreaCount", beginTimeParameter, endTimeParameter, siteIdParameter, oDataAccessTokenParameter);
    }

    public virtual ObjectResult<BHSTop5JamDeviceswithCount_Result> BHSTop5JamDeviceswithCount(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSTop5JamDeviceswithCount_Result>("BHSTop5JamDeviceswithCount", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSAlarmAreaCountDetails_Result> BHSAlarmAreaCountDetails(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, string bHSName, string area, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var bHSNameParameter = bHSName != null ?
            new ObjectParameter("BHSName", bHSName) :
            new ObjectParameter("BHSName", typeof(string));

        var areaParameter = area != null ?
            new ObjectParameter("Area", area) :
            new ObjectParameter("Area", typeof(string));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSAlarmAreaCountDetails_Result>("BHSAlarmAreaCountDetails", beginTimeParameter, endTimeParameter, bHSNameParameter, areaParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSAlarmsHistoryByAlarmTypeAndDateRangeWithDurationInSeconds_Result> BHSAlarmsHistoryByAlarmTypeAndDateRangeWithDurationInSeconds(Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, Nullable<long> siteId, string alarmType)
    {
        var startDateParameter = startDate.HasValue ?
            new ObjectParameter("startDate", startDate) :
            new ObjectParameter("startDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("endDate", endDate) :
            new ObjectParameter("endDate", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("siteId", siteId) :
            new ObjectParameter("siteId", typeof(long));

        var alarmTypeParameter = alarmType != null ?
            new ObjectParameter("alarmType", alarmType) :
            new ObjectParameter("alarmType", typeof(string));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSAlarmsHistoryByAlarmTypeAndDateRangeWithDurationInSeconds_Result>("BHSAlarmsHistoryByAlarmTypeAndDateRangeWithDurationInSeconds", startDateParameter, endDateParameter, siteIdParameter, alarmTypeParameter);
    }

    public virtual ObjectResult<BHSBagPathDurationCumlativeHourlyAggregatePlusEmptyHours_Result> BHSBagPathDurationCumlativeHourlyAggregatePlusEmptyHours(Nullable<System.DateTime> beginDateTime, Nullable<System.DateTime> endDateTime, Nullable<long> siteId)
    {
        var beginDateTimeParameter = beginDateTime.HasValue ?
            new ObjectParameter("BeginDateTime", beginDateTime) :
            new ObjectParameter("BeginDateTime", typeof(System.DateTime));

        var endDateTimeParameter = endDateTime.HasValue ?
            new ObjectParameter("EndDateTime", endDateTime) :
            new ObjectParameter("EndDateTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSBagPathDurationCumlativeHourlyAggregatePlusEmptyHours_Result>("BHSBagPathDurationCumlativeHourlyAggregatePlusEmptyHours", beginDateTimeParameter, endDateTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSTop5JamDeviceswithLongestDuration_Result> BHSTop5JamDeviceswithLongestDuration(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSTop5JamDeviceswithLongestDuration_Result>("BHSTop5JamDeviceswithLongestDuration", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSPercentOfFailSafePerDay_Result1> BHSPercentOfFailSafePerDay(Nullable<System.DateTime> beginDateTime, Nullable<System.DateTime> endDateTime, Nullable<long> siteId)
    {
        var beginDateTimeParameter = beginDateTime.HasValue ?
            new ObjectParameter("BeginDateTime", beginDateTime) :
            new ObjectParameter("BeginDateTime", typeof(System.DateTime));

        var endDateTimeParameter = endDateTime.HasValue ?
            new ObjectParameter("EndDateTime", endDateTime) :
            new ObjectParameter("EndDateTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSPercentOfFailSafePerDay_Result1>("BHSPercentOfFailSafePerDay", beginDateTimeParameter, endDateTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSPercentOfFailSafePerHour_Result1> BHSPercentOfFailSafePerHour(Nullable<System.DateTime> beginDateTime, Nullable<System.DateTime> endDateTime, Nullable<long> siteId)
    {
        var beginDateTimeParameter = beginDateTime.HasValue ?
            new ObjectParameter("BeginDateTime", beginDateTime) :
            new ObjectParameter("BeginDateTime", typeof(System.DateTime));

        var endDateTimeParameter = endDateTime.HasValue ?
            new ObjectParameter("EndDateTime", endDateTime) :
            new ObjectParameter("EndDateTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSPercentOfFailSafePerHour_Result1>("BHSPercentOfFailSafePerHour", beginDateTimeParameter, endDateTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<spTerminalOverviewGraphicsAndTags_Result> spTerminalOverviewGraphicsAndTags(Nullable<long> terminalSystemId)
    {
        var terminalSystemIdParameter = terminalSystemId.HasValue ?
            new ObjectParameter("terminalSystemId", terminalSystemId) :
            new ObjectParameter("terminalSystemId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<spTerminalOverviewGraphicsAndTags_Result>("spTerminalOverviewGraphicsAndTags", terminalSystemIdParameter);
    }

    public virtual ObjectResult<GSAlertCountByDay_Result> GSAlertCountByDay(Nullable<long> siteId, Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate)
    {
        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        var startDateParameter = startDate.HasValue ?
            new ObjectParameter("StartDate", startDate) :
            new ObjectParameter("StartDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("EndDate", endDate) :
            new ObjectParameter("EndDate", typeof(System.DateTime));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<GSAlertCountByDay_Result>("GSAlertCountByDay", siteIdParameter, startDateParameter, endDateParameter);
    }

    public virtual ObjectResult<GSAlertCountByhour_Result> GSAlertCountByhour(Nullable<long> siteId, Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate)
    {
        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        var startDateParameter = startDate.HasValue ?
            new ObjectParameter("StartDate", startDate) :
            new ObjectParameter("StartDate", typeof(System.DateTime));

        var endDateParameter = endDate.HasValue ?
            new ObjectParameter("EndDate", endDate) :
            new ObjectParameter("EndDate", typeof(System.DateTime));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<GSAlertCountByhour_Result>("GSAlertCountByhour", siteIdParameter, startDateParameter, endDateParameter);
    }

    public virtual ObjectResult<GSTop5AlarmTypes_Result> GSTop5AlarmTypes(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<GSTop5AlarmTypes_Result>("GSTop5AlarmTypes", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<GSTop5AlarmTypes3_Result> GSTop5AlarmTypes3(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<GSTop5AlarmTypes3_Result>("GSTop5AlarmTypes3", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<GSTop5AlarmTypesByEquipment_Result> GSTop5AlarmTypesByEquipment(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<GSTop5AlarmTypesByEquipment_Result>("GSTop5AlarmTypesByEquipment", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    [DbFunction("iOPS_NormalizedEntities", "GSEquipmentUsage_TVF_Query")]
    public virtual IQueryable<GSEquipmentUsage_TVF_Query_Result> GSEquipmentUsage_TVF_Query(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<GSEquipmentUsage_TVF_Query_Result>("[iOPS_NormalizedEntities].[GSEquipmentUsage_TVF_Query](@BeginTime, @EndTime, @SiteId)", beginTimeParameter, endTimeParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSFilterByAlarmTypesbyArea_Result> BHSFilterByAlarmTypesbyArea(Nullable<System.DateTime> beginTime, Nullable<System.DateTime> endTime, string alarmTypeList, Nullable<int> topNumber, Nullable<long> siteId)
    {
        var beginTimeParameter = beginTime.HasValue ?
            new ObjectParameter("BeginTime", beginTime) :
            new ObjectParameter("BeginTime", typeof(System.DateTime));

        var endTimeParameter = endTime.HasValue ?
            new ObjectParameter("EndTime", endTime) :
            new ObjectParameter("EndTime", typeof(System.DateTime));

        var alarmTypeListParameter = alarmTypeList != null ?
            new ObjectParameter("AlarmTypeList", alarmTypeList) :
            new ObjectParameter("AlarmTypeList", typeof(string));

        var topNumberParameter = topNumber.HasValue ?
            new ObjectParameter("TopNumber", topNumber) :
            new ObjectParameter("TopNumber", typeof(int));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSFilterByAlarmTypesbyArea_Result>("BHSFilterByAlarmTypesbyArea", beginTimeParameter, endTimeParameter, alarmTypeListParameter, topNumberParameter, siteIdParameter);
    }

    public virtual ObjectResult<BHSPercentCBRAPerDay_Result> BHSPercentCBRAPerDay(Nullable<System.DateTime> beginDateTime, Nullable<System.DateTime> endDateTime, Nullable<long> siteId)
    {
        var beginDateTimeParameter = beginDateTime.HasValue ?
            new ObjectParameter("BeginDateTime", beginDateTime) :
            new ObjectParameter("BeginDateTime", typeof(System.DateTime));

        var endDateTimeParameter = endDateTime.HasValue ?
            new ObjectParameter("EndDateTime", endDateTime) :
            new ObjectParameter("EndDateTime", typeof(System.DateTime));

        var siteIdParameter = siteId.HasValue ?
            new ObjectParameter("SiteId", siteId) :
            new ObjectParameter("SiteId", typeof(long));

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<BHSPercentCBRAPerDay_Result>("BHSPercentCBRAPerDay", beginDateTimeParameter, endDateTimeParameter, siteIdParameter);
    }
}
