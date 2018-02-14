using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.ModelBinding;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.OdataV4
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.OData.Builder;
    using System.Web.OData.Extensions;
    using iOPS_ODataV4.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<SystemGroup>("SystemGroups");
    builder.EntitySet<Asset>("Assets"); 
    builder.EntitySet<Company>("Companies"); 
    builder.EntitySet<Site>("Sites"); 
    builder.EntitySet<SystemType>("SystemTypes"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class SystemGroupsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/SystemGroups
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<SystemGroup> GetSystemGroups()
        {
            return db.SystemGroups;
        }

        // GET: odata/SystemGroups(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<SystemGroup> GetSystemGroup([FromODataUri] long key)
        {
            return SingleResult.Create(db.SystemGroups.Where(systemGroup => systemGroup.Id == key));
        }

       
        // POST: odata/SystemGroups
        public async Task<IHttpActionResult> Post(SystemGroup entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new SystemGroup { Id = -entity.Id };
                db.SystemGroups.Attach(delEntity);
                db.SystemGroups.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.SystemGroups.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.SystemGroups.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.SystemGroups.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }



        // GET: odata/SystemGroups(5)/Assets
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Asset> GetAssets([FromODataUri] long key)
        {
            return db.SystemGroups.Where(m => m.Id == key).SelectMany(m => m.Assets);
        }

        // GET: odata/SystemGroups(5)/Company
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Company> GetCompany([FromODataUri] long key)
        {
            return SingleResult.Create(db.SystemGroups.Where(m => m.Id == key).Select(m => m.Company));
        }

        // GET: odata/SystemGroups(5)/Site
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.SystemGroups.Where(m => m.Id == key).Select(m => m.Site));
        }

        // GET: odata/SystemGroups(5)/Children
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<SystemGroup> GetChildren([FromODataUri] long key)
        {
            return db.SystemGroups.Where(m => m.Id == key).SelectMany(m => m.Children);
        }

        // GET: odata/SystemGroups(5)/SystemGraphics
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<SystemGraphic> GetSystemGraphics([FromODataUri] long key)
        {
            return db.SystemGroups.Where(m => m.Id == key).SelectMany(m => m.SystemGraphics);
        }

        // GET: odata/SystemGroups(5)/Parent
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<SystemGroup> GetParent([FromODataUri] long key)
        {
            return SingleResult.Create(db.SystemGroups.Where(m => m.Id == key).Select(m => m.Parent));
        }

        // GET: odata/SystemGroups(5)/SystemType
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<SystemType> GetSystemType([FromODataUri] long key)
        {
            return SingleResult.Create(db.SystemGroups.Where(m => m.Id == key).Select(m => m.SystemType));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SystemGroupExists(long key)
        {
            return db.SystemGroups.Count(e => e.Id == key) > 0;
        }
    }
}
