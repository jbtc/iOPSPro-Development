using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iOPS_ETL
{
    class Program
    {
        static void Main(string[] args)
        {

            for (;;)
            {
                try
                {
                    using (var db = new iOPS_NormalizedEntities())
                    {
                        //Console.WriteLine("Opening data set");
                        var messages = db.ChronologicalRawTagValueLogKepwareReceivers
                            .OrderBy(t => t.ObservationDateTime)
                            .Take(50000)
                            .GroupBy(
                                    t => t.TagName,
                                    t => t,
                                    (key, g) => new { TagName = key, Observations = g.OrderBy(o => o.ObservationDateTime).ToList() })
                            .ToList();

                        Console.WriteLine("Dataset Size = " + messages.Count.ToString());



                        messages.AsParallel().WithDegreeOfParallelism(30).ForAll(tagValue =>
                        {
                            
                        });


                        //Console.WriteLine("Dataset Size = " + messages.Count.ToString());
                        foreach (var tag in messages)
                        {
                            //Console.WriteLine(queueLength);
                        }

                    }
                    Task.Delay(20).Wait();

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }



        }
    }
}
