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
    builder.EntitySet<StateAbbreviation>("StateAbbreviations");
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class StateAbbreviationsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/StateAbbreviations
        [EnableQuery]
        public IQueryable<StateAbbreviation> GetStateAbbreviations()
        {
            return db.StateAbbreviations;
        }

        // GET: odata/StateAbbreviations(5)
        [EnableQuery]
        public SingleResult<StateAbbreviation> GetStateAbbreviation([FromODataUri] long key)
        {
            return SingleResult.Create(db.StateAbbreviations.Where(stateAbbreviation => stateAbbreviation.Id == key));
        }

       
        // POST: odata/StateAbbreviations
       public async Task<IHttpActionResult> Post(StateAbbreviation entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new StateAbbreviation { Id = -entity.Id };
                db.StateAbbreviations.Attach(delEntity);
                db.StateAbbreviations.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.StateAbbreviations.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.StateAbbreviations.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.StateAbbreviations.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool StateAbbreviationExists(long key)
        {
            return db.StateAbbreviations.Count(e => e.Id == key) > 0;
        }
    }
}
