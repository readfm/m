package com.gg.generated;

import java.util.Arrays;
import java.util.List;
import org.unimodules.core.interfaces.Package;

public class BasePackageList {
  public List<Package> getPackageList() {
    return Arrays.<Package>asList(
        new org.unimodules.adapters.react.ReactAdapterPackage(),
        new expo.modules.av.AVPackage(),
        new expo.modules.constants.ConstantsPackage(),
        new expo.modules.documentpicker.DocumentPickerPackage(),
        new expo.modules.filesystem.FileSystemPackage(),
        new expo.modules.imagepicker.ImagePickerPackage(),
        new expo.modules.permissions.PermissionsPackage()
    );
  }
}
