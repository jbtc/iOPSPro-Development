﻿

//------------------------------------------------------------------------------
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


public partial class FileImageLibraryEntities : DbContext
{
    public FileImageLibraryEntities()
        : base("name=FileImageLibraryEntities")
    {

    }

    protected override void OnModelCreating(DbModelBuilder modelBuilder)
    {
        throw new UnintentionalCodeFirstException();
    }


    public virtual DbSet<FileImage> FileImages { get; set; }


    public virtual ObjectResult<byte[]> Get_Encrypted_File_Image(Nullable<long> numFile_Image_ID)
    {

        var numFile_Image_IDParameter = numFile_Image_ID.HasValue ?
            new ObjectParameter("numFile_Image_ID", numFile_Image_ID) :
            new ObjectParameter("numFile_Image_ID", typeof(long));


        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<byte[]>("Get_Encrypted_File_Image", numFile_Image_IDParameter);
    }


    public virtual ObjectResult<Save_Encrypted_File_Image_Result> Save_Encrypted_File_Image(Nullable<decimal> numFile_Image_ID, byte[] imgImage)
    {

        var numFile_Image_IDParameter = numFile_Image_ID.HasValue ?
            new ObjectParameter("numFile_Image_ID", numFile_Image_ID) :
            new ObjectParameter("numFile_Image_ID", typeof(decimal));


        var imgImageParameter = imgImage != null ?
            new ObjectParameter("imgImage", imgImage) :
            new ObjectParameter("imgImage", typeof(byte[]));


        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<Save_Encrypted_File_Image_Result>("Save_Encrypted_File_Image", numFile_Image_IDParameter, imgImageParameter);
    }


    public virtual ObjectResult<Nullable<decimal>> SYS_Next_Sequence_Number()
    {

        return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<Nullable<decimal>>("SYS_Next_Sequence_Number");
    }

}

